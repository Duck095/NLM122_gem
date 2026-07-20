import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";

export function PageShell({ children, tone = "default" }: PropsWithChildren<{ tone?: "default" | "host" | "player" | "screen" }>) {
  return (
    <div className={`page-shell tone-${tone}`}>
      <div className="heritage-decor" aria-hidden="true">
        <i className="heritage-corner corner-nw" />
        <i className="heritage-corner corner-ne" />
        <i className="heritage-corner corner-sw" />
        <i className="heritage-corner corner-se" />
        <span className="heritage-medallion medallion-left" />
        <span className="heritage-medallion medallion-right" />
        <span className="heritage-diamond-row"><i /><i /><i /></span>
      </div>
      {children}
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  actions,
  status
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div>
        <div className="brand-line">MLN122 · VIỆT NAM 2045</div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="topbar-actions">
        {status}
        {actions}
      </div>
    </header>
  );
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "neutral" | "success" | "warning" | "danger" | "info" }>) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "success" }) {
  return <button type="button" className={`button button-${variant} ${className}`.trim()} {...props} />;
}

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◇</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function Field({ label, hint, children }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function Modal({ title, children, onClose }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" aria-label="Đóng" onClick={onClose}>×</button>
        </div>
        {children}
      </section>
    </div>
  );
}
