import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { AckResponse, RoomPublicState, SocketRole } from "@mln122/shared";
import { getApiBase } from "../lib/config";

export function useRoomSocket(input: {
  roomCode: string;
  role: SocketRole;
  token?: string | null;
  teamId?: string | null;
}) {
  const [room, setRoom] = useState<RoomPublicState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setRoom(null);
    setConnected(false);
    setError(null);

    if (!input.roomCode) return;
    if (input.role !== "screen" && !input.token) return;

    // Tao socket ben trong effect de React StrictMode co the huy va tao lai
    // mot ket noi moi dung cach trong moi truong dev.
    const socket = io(getApiBase(), {
      auth: {
        roomCode: input.roomCode,
        role: input.role,
        token: input.token || undefined,
        teamId: input.teamId || undefined
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 800,
      timeout: 10000
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      setError(null);
      socket.emit("room:request-state");
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectError = (event: Error) => {
      setConnected(false);
      setError(event.message || "Khong the ket noi may chu");
    };

    const handleRoomState = (nextRoom: RoomPublicState) => {
      setRoom(nextRoom);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room:state", handleRoomState);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room:state", handleRoomState);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [input.roomCode, input.role, input.token, input.teamId]);

  const emitAck = useCallback(
    <T,>(event: string, payload: unknown = {}): Promise<T> =>
      new Promise((resolve, reject) => {
        const socket = socketRef.current;

        if (!socket || !socket.connected) {
          reject(new Error("Chua ket noi may chu"));
          return;
        }

        socket
          .timeout(6000)
          .emit(
            event,
            payload,
            (timeoutError: Error | null, response?: AckResponse<T>) => {
              if (timeoutError) {
                reject(new Error("May chu khong phan hoi"));
                return;
              }

              if (!response?.ok) {
                reject(new Error(response?.error || "Thao tac that bai"));
                return;
              }

              resolve(response.data as T);
            }
          );
      }),
    []
  );

  return { room, connected, error, emitAck };
}
