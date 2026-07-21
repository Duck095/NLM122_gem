import type {
  EventDefinitionPublic,
  IndicatorKey,
  Indicators,
  ProjectDefinitionPublic,
  StrategyPackagePublic,
  TacticalCardType
} from "@mln122/shared";

export interface QuestionDefinition {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BlindRewardDefinition {
  kind: "card" | "capital" | "indicator";
  name: string;
  description: string;
  cardType?: TacticalCardType;
  capital?: number;
  indicator?: IndicatorKey;
  points?: number;
}

export const INITIAL_INDICATORS: Indicators = {
  economy: 35,
  technology: 30,
  autonomy: 30,
  equality: 35,
  sustainability: 30
};

export const QUESTIONS: QuestionDefinition[] = [
  {
    id: "q01",
    prompt: "Đại hội Đảng nào đã mở đầu cho công cuộc Đổi mới vào năm 1986?",
    options: ["Đại hội V (1982) ", 
              "Đại hội VI (1986) ", 
              "Đại hội VII (1991) ", 
              "Đại hội VIII (1996)"],
    correctIndex: 2,
    explanation: "Vì Đại hội VI năm 1986 mở đầu đường lối Đổi mới ở Việt Nam."
  },
  {
    id: "q02",
    prompt: "Giai đoạn 1986–1995, Việt Nam tập trung phát triển các chương trình kinh tế nào?",
    options: ["Công nghiệp nặng và hóa chất", 
              "Công nghiệp số và trí tuệ nhân tạo", 
              "Nông nghiệp, tiêu dùng, xuất khẩu", 
              "Dịch vụ tài chính và du lịch"],
    correctIndex: 3,
    explanation: "Vì giai đoạn đầu Đổi mới ưu tiên nông nghiệp, hàng tiêu dùng và xuất khẩu."
  },
  {
    id: "q03",
    prompt: "Văn bản luật nào ban hành năm 1987 giúp thu hút vốn và công nghệ nước ngoài?",
    options: ["Luật Đầu tư nước ngoài",
              "Luật Doanh nghiệp tư nhân", 
              "Luật Thương mại quốc tế", 
              "Luật Đất đai sửa đổi"],
    correctIndex: 1,
    explanation: "Vì Luật Đầu tư nước ngoài năm 1987 giúp thu hút vốn và công nghệ từ nước ngoài."
  },
  {
    id: "q04",
    prompt: "Thành tựu nông nghiệp nổi bật nhất của Việt Nam trong giai đoạn đầu Đổi mới là:",
    options: [
      "Cơ giới hóa toàn bộ đồng ruộng ",
      "Trở thành nước nhập khẩu gạo",
      "Xây dựng xong các đập thủy lợi",
      "Từ thiếu đói sang xuất khẩu gạo"
    ],
    correctIndex: 4,
    explanation: "Vì Việt Nam đã từ thiếu lương thực trở thành nước xuất khẩu gạo."
  },
  {
    id: "q05",
    prompt: "Nhiệm vụ trọng tâm được Đại hội VIII (1996) xác định cho đất nước là gì?",
    options: [
      " Khắc phục khủng hoảng kinh tế",
      "Đẩy mạnh công nghiệp hóa (CNH)",
      "Phát triển mạnh kinh tế tri thức",
      "Chuyển đổi số nền kinh tế xanh"
    ],
    correctIndex: 2,
    explanation: "Vì Đại hội VIII xác định nhiệm vụ đẩy mạnh công nghiệp hóa, hiện đại hóa."
  },
  {
    id: "q06",
    prompt: "Việt Nam chính thức trở thành thành viên Tổ chức Thương mại Thế giới (WTO) năm nào?",
    options: [
      "1995 ",
      "2000 ",
      "2007",
      "2011"
    ],
    correctIndex: 3,
    explanation: "Vì Việt Nam chính thức gia nhập WTO vào năm 2007."
  },
  {
    id: "q07",
    prompt: "Hạn chế lớn của ngành công nghiệp Việt Nam trong giai đoạn 1996–2010 là gì?",
    options: [
      "Không có vốn đầu tư từ nước ngoài",
      "Thiếu các vùng kinh tế trọng điểm",
      "Chỉ tập trung vào ngành nông nghiệp",
      "Chủ yếu là gia công và lắp ráp"
    ],
    correctIndex: 4,
    explanation: "Vì công nghiệp Việt Nam còn phụ thuộc nhiều vào gia công và lắp ráp."
  },
  {
    id: "q08",
    prompt: "Từ năm 2011, mô hình tăng trưởng của Việt Nam chuyển sang dựa nhiều hơn vào yếu tố: ",
    options: [
      "Tài nguyên và lao động giá rẻ",
      "Khoa học và đổi mới sáng tạo",
      "Vốn đầu tư của ngân sách nhà nước",
      "Khai thác và xuất khẩu khoáng sản"
    ],
    correctIndex: 2,
    explanation: "Vì Việt Nam chuyển sang phát triển dựa nhiều hơn vào khoa học và đổi mới sáng tạo."
  },
  {
    id: "q09",
    prompt: "Công nghệ nào sau đây là đặc trưng tiêu biểu của Cách mạng công nghiệp 4.0?",
    options: [
      "Máy hơi nước và máy dệt cơ khí",
      "Động cơ đốt trong và điện năng",
      "AI, Internet vạn vật, Dữ liệu lớn",
      "Kỹ thuật luyện kim và in ấn cũ"
    ],
    correctIndex: 3,
    explanation: "Vì AI, Internet vạn vật và Dữ liệu lớn là công nghệ tiêu biểu của cách mạng 4.0."
  },
  {
    id: "q10",
    prompt: "Hiệp định thương mại tự do (FTA) thế hệ mới nào Việt Nam đã tham gia gần đây?",
    options: [
      "Hiệp định AFTA và APEC",
      " Hiệp định WTO và ASEAN",
      "Hiệp định SEV và SEATO",
      "Hiệp định CPTPP và EVFTA"
    ],
    correctIndex: 4,
    explanation: "Vì CPTPP và EVFTA là các hiệp định thương mại tự do thế hệ mới."
  },
  {
    id: "q11",
    prompt: "Thách thức lớn về lao động mà Việt Nam đối mặt trong bối cảnh tự động hóa là: ",
    options: [
      "Thừa quá nhiều lao động chất lượng",
      "Mất việc làm ở nhóm kỹ năng thấp",
      "Lao động không muốn làm công nghệ",
      "Tỷ lệ lao động biết chữ còn quá thấp"
    ],
    correctIndex: 2,
    explanation: "Vì tự động hóa có thể thay thế lao động có kỹ năng thấp."
  },
  {
    id: "q12",
    prompt: "Theo mô hình CNH truyền thống, nguồn lực chủ yếu dựa vào yếu tố nào?",
    options: [
      "Vốn, tài nguyên, lao động rẻ",
      "Tri thức và dữ liệu số",
      "Công nghệ AI và Robot",
      "Nguồn nhân lực chất lượng cao"
    ],
    correctIndex: 1,
    explanation: "Vì công nghiệp hóa truyền thống chủ yếu dựa vào vốn, tài nguyên và lao động rẻ."
  },
  {
    id: "q13",
    prompt: "Đặc điểm về thời gian thực hiện của mô hình CNH hiện đại (4.0) là:",
    options: [
      "Luôn kéo dài qua nhiều thế kỷ",
      "Phải diễn ra tuần tự từng bước",
      "Không thể xác định được thời gian",
      "Có thể rút ngắn nhờ công nghệ"
    ],
    correctIndex: 4,
    explanation: "Vì công nghệ hiện đại giúp rút ngắn quá trình công nghiệp hóa."
  },
  {
    id: "q14",
    prompt: "Mục tiêu về môi trường trong mô hình CNH–HĐH hiện nay hướng tới điều gì?",
    options: [
      "Khai thác tối đa tài nguyên có sẵn",
      "Chấp nhận ô nhiễm để tăng trưởng",
      "Gắn với kinh tế xanh và tuần hoàn",
      "Chỉ tập trung vào công nghiệp nặng"
    ],
    correctIndex: 3,
    explanation: "Vì công nghiệp hóa hiện nay phải gắn với bảo vệ môi trường và phát triển bền vững."
  },
  {
    id: "q15",
    prompt: "Mục tiêu cuối cùng của quá trình CNH–HĐH là xây dựng đất nước theo hướng:",
    options: [
      "Chỉ ưu tiên tăng trưởng GDP",
      "Dân giàu, nước mạnh, công bằng",
      "Độc quyền sản xuất công nghệ ",
      "Xóa bỏ hoàn toàn ngành nông nghiệp"
    ],
    correctIndex: 3,
    explanation: "Vì công nghiệp hóa – hiện đại hóa không chỉ nhằm tăng trưởng kinh tế mà còn hướng tới nâng cao đời sống nhân dân, xây dựng đất nước giàu mạnh và xã hội công bằng."
  }
];

export const BLIND_REWARDS: BlindRewardDefinition[] = [
  {
    kind: "card",
    cardType: "shield",
    name: "Lá chắn khủng hoảng",
    description: "Hủy toàn bộ phần trừ điểm chỉ số của một sự kiện; chi phí vốn của phương án vẫn được áp dụng."
  },
  {
    kind: "card",
    cardType: "shield",
    name: "Lá chắn khủng hoảng",
    description: "Hủy toàn bộ phần trừ điểm chỉ số của một sự kiện; chi phí vốn của phương án vẫn được áp dụng."
  },
  {
    kind: "card",
    cardType: "project_recovery",
    name: "Phục hồi dự án",
    description: "Giảm 50% tổng điểm chỉ số bị trừ khi xử lý một sự kiện."
  },
  {
    kind: "card",
    cardType: "auction_discount_50",
    name: "Đặc quyền đầu tư 50%",
    description: "Khi thắng đấu giá, chỉ thanh toán 50% mức giá đã chốt."
  },
  {
    kind: "card",
    cardType: "auction_discount_30",
    name: "Ưu đãi đầu tư 30%",
    description: "Khi thắng đấu giá, được giảm 30% mức giá đã chốt."
  },
  {
    kind: "indicator",
    indicator: "economy",
    points: 7,
    name: "Bứt phá kinh tế",
    description: "+7 điểm Tăng trưởng kinh tế."
  },
  {
    kind: "indicator",
    indicator: "technology",
    points: 7,
    name: "Đột phá công nghệ",
    description: "+7 điểm Hiện đại hóa công nghệ."
  },
  {
    kind: "indicator",
    indicator: "autonomy",
    points: 7,
    name: "Sức mạnh nội địa",
    description: "+7 điểm Tự chủ nội địa."
  },
  {
    kind: "indicator",
    indicator: "equality",
    points: 7,
    name: "Thịnh vượng sẻ chia",
    description: "+7 điểm Công bằng xã hội."
  },
  {
    kind: "indicator",
    indicator: "sustainability",
    points: 7,
    name: "Tương lai xanh",
    description: "+7 điểm Phát triển bền vững."
  },
  {
    kind: "capital",
    capital: 60,
    name: "Nguồn vốn khởi sắc",
    description: "+60 triệu vốn."
  },
  {
    kind: "capital",
    capital: 60,
    name: "Nguồn vốn khởi sắc",
    description: "+60 triệu vốn."
  },
  {
    kind: "capital",
    capital: 65,
    name: "Gói đầu tư tăng tốc",
    description: "+65 triệu vốn."
  },
  {
    kind: "capital",
    capital: 65,
    name: "Gói đầu tư tăng tốc",
    description: "+65 triệu vốn."
  },
  {
    kind: "capital",
    capital: 75,
    name: "Quỹ đầu tư chiến lược",
    description: "+75 triệu vốn."
  }
];

export const PROJECTS: ProjectDefinitionPublic[] = [
  {
    id: "data-center",
    name: "Trung tâm dữ liệu quốc gia",
    description: "Hạ tầng dữ liệu, điện toán và an toàn thông tin phục vụ chuyển đổi số.",
    startPrice: 250,
    effects: { technology: 18, autonomy: 8, economy: 5 }
  },
  {
    id: "smart-logistics",
    name: "Hành lang logistics thông minh",
    description: "Kết nối cảng, đường bộ, kho vận và hệ thống điều phối bằng dữ liệu thời gian thực.",
    startPrice: 300,
    effects: { economy: 15, technology: 8, equality: 4 }
  },
  {
    id: "green-manufacturing",
    name: "Tổ hợp sản xuất công nghiệp xanh",
    description: "Nhà máy hiệu suất cao, tiết kiệm năng lượng và giảm phát thải.",
    startPrice: 350,
    effects: { sustainability: 17, technology: 7, economy: 8 }
  }
];

export const EVENTS: EventDefinitionPublic[] = [
  {
    id: "supply-chain",
    name: "Đứt gãy chuỗi cung ứng toàn cầu",
    description: "Chi phí đầu vào tăng và nguồn cung linh kiện chiến lược bị gián đoạn.",
    options: [
      {
        id: "localize",
        title: "Nội địa hóa chuỗi cung ứng",
        description: "Đầu tư nhà cung ứng trong nước, chấp nhận chi phí ngắn hạn để tăng tự chủ.",
        capitalCost: 90,
        effects: { autonomy: 16, technology: 5, economy: -4 }
      },
      {
        id: "diversify",
        title: "Đa dạng hóa đối tác",
        description: "Mở thêm thị trường và nhà cung ứng nhằm giảm phụ thuộc.",
        capitalCost: 60,
        effects: { economy: 8, autonomy: 6, sustainability: -3 }
      },
      {
        id: "wait",
        title: "Duy trì hoạt động hiện tại",
        description: "Tiết kiệm vốn nhưng chịu tác động mạnh từ cú sốc.",
        capitalCost: 0,
        effects: { economy: -12, technology: -6, autonomy: -8 }
      }
    ]
  },
  {
    id: "energy-crisis",
    name: "Khủng hoảng năng lượng",
    description: "Giá năng lượng tăng nhanh, gây áp lực lên sản xuất và đời sống.",
    options: [
      {
        id: "renewable",
        title: "Đẩy nhanh năng lượng tái tạo",
        description: "Đầu tư lớn để giảm phụ thuộc và tạo nền tảng xanh.",
        capitalCost: 110,
        effects: { sustainability: 18, autonomy: 8, economy: -3 }
      },
      {
        id: "efficiency",
        title: "Nâng hiệu suất sử dụng năng lượng",
        description: "Cải tiến công nghệ và quy trình để giảm tiêu hao.",
        capitalCost: 70,
        effects: { technology: 10, sustainability: 9, economy: 3 }
      },
      {
        id: "subsidize",
        title: "Trợ giá ngắn hạn",
        description: "Giảm áp lực xã hội trước mắt nhưng làm suy yếu nguồn lực đầu tư.",
        capitalCost: 80,
        effects: { equality: 10, economy: -7, sustainability: -4 }
      }
    ]
  },
  {
    id: "automation",
    name: "Tự động hóa và dịch chuyển lao động",
    description: "Robot và AI làm thay đổi nhanh nhu cầu kỹ năng trong thị trường lao động.",
    options: [
      {
        id: "reskill",
        title: "Đào tạo lại quy mô lớn",
        description: "Đầu tư kỹ năng số và chương trình chuyển đổi nghề nghiệp.",
        capitalCost: 95,
        effects: { equality: 16, technology: 8, economy: 4 }
      },
      {
        id: "rapid-automation",
        title: "Tự động hóa nhanh",
        description: "Tăng năng suất mạnh nhưng tạo áp lực phân hóa xã hội.",
        capitalCost: 75,
        effects: { technology: 16, economy: 12, equality: -10 }
      },
      {
        id: "slowdown",
        title: "Giảm tốc chuyển đổi",
        description: "Giảm cú sốc lao động nhưng bỏ lỡ cơ hội công nghệ.",
        capitalCost: 20,
        effects: { equality: 5, technology: -9, economy: -5 }
      }
    ]
  }
];

export const STRATEGY_PACKAGES: StrategyPackagePublic[] = [
  {
    id: "digital-workforce",
    name: "Nhân lực cho kỷ nguyên số",
    description: "Đào tạo kỹ năng số, quản trị hiện đại và năng lực đổi mới sáng tạo.",
    cost: 180,
    effects: { technology: 14, equality: 10, economy: 5 }
  },
  {
    id: "digital-infrastructure",
    name: "Hạ tầng số quốc gia",
    description: "Mở rộng kết nối, dữ liệu và nền tảng số dùng chung.",
    cost: 210,
    effects: { technology: 18, autonomy: 9, economy: 6 }
  },
  {
    id: "domestic-industry",
    name: "Công nghiệp nội địa vững mạnh",
    description: "Phát triển doanh nghiệp đầu đàn, công nghiệp hỗ trợ và chuỗi cung ứng nội địa.",
    cost: 200,
    effects: { autonomy: 17, economy: 10, equality: 4 }
  },
  {
    id: "inclusive-green",
    name: "Chuyển đổi xanh bao trùm",
    description: "Kết hợp sản xuất xanh, công bằng xã hội và phát triển vùng.",
    cost: 190,
    effects: { sustainability: 18, equality: 10, economy: 4 }
  }
];
