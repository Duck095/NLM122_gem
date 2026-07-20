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
    prompt: "Đại hội nào mở ra công cuộc Đổi mới ở Việt Nam?",
    options: ["Đại hội IV", "Đại hội V", "Đại hội VI", "Đại hội VII"],
    correctIndex: 2,
    explanation: "Đại hội VI của Đảng năm 1986 khởi xướng đường lối Đổi mới toàn diện."
  },
  {
    id: "q02",
    prompt: "Việt Nam chính thức gia nhập ASEAN vào năm nào?",
    options: ["1986", "1995", "2000", "2007"],
    correctIndex: 1,
    explanation: "Việt Nam trở thành thành viên thứ bảy của ASEAN vào ngày 28/7/1995."
  },
  {
    id: "q03",
    prompt: "Việt Nam trở thành thành viên của WTO vào năm nào?",
    options: ["1995", "2001", "2007", "2010"],
    correctIndex: 2,
    explanation: "Việt Nam chính thức trở thành thành viên WTO vào ngày 11/1/2007."
  },
  {
    id: "q04",
    prompt: "Mục tiêu quan trọng của công nghiệp hóa, hiện đại hóa là gì?",
    options: [
      "Chỉ tăng sản lượng nông nghiệp",
      "Chuyển đổi căn bản nền sản xuất và nâng cao năng suất",
      "Giảm hội nhập kinh tế quốc tế",
      "Chỉ phát triển các đô thị lớn"
    ],
    correctIndex: 1,
    explanation: "Công nghiệp hóa, hiện đại hóa hướng đến chuyển đổi nền sản xuất, nâng năng suất và chất lượng phát triển."
  },
  {
    id: "q05",
    prompt: "Nội dung nào phản ánh đúng kinh tế tri thức?",
    options: [
      "Tri thức và đổi mới sáng tạo trở thành nguồn lực chủ yếu",
      "Tài nguyên thiên nhiên là nguồn lực duy nhất",
      "Giảm sử dụng công nghệ trong sản xuất",
      "Tách rời giáo dục với doanh nghiệp"
    ],
    correctIndex: 0,
    explanation: "Kinh tế tri thức coi tri thức, công nghệ và đổi mới sáng tạo là động lực trung tâm."
  },
  {
    id: "q06",
    prompt: "Cách mạng công nghiệp lần thứ tư gắn nổi bật với nhóm công nghệ nào?",
    options: [
      "Hơi nước và cơ khí",
      "Điện và dây chuyền lắp ráp",
      "Điện tử và máy tính cá nhân",
      "AI, dữ liệu lớn, IoT và tự động hóa thông minh"
    ],
    correctIndex: 3,
    explanation: "Cách mạng công nghiệp 4.0 nổi bật với AI, IoT, dữ liệu lớn, robot và các hệ thống kết nối thông minh."
  },
  {
    id: "q07",
    prompt: "FDI có thể đóng góp trực tiếp cho quá trình công nghiệp hóa thông qua yếu tố nào?",
    options: [
      "Bổ sung vốn, công nghệ và kinh nghiệm quản trị",
      "Loại bỏ hoàn toàn doanh nghiệp trong nước",
      "Giảm nhu cầu đào tạo lao động",
      "Ngăn cản xuất khẩu"
    ],
    correctIndex: 0,
    explanation: "FDI có thể bổ sung vốn, công nghệ, quản trị và kết nối thị trường nếu được khai thác hiệu quả."
  },
  {
    id: "q08",
    prompt: "Phát triển công nghiệp hỗ trợ có ý nghĩa quan trọng nhất đối với điều gì?",
    options: [
      "Tăng phụ thuộc nhập khẩu",
      "Nâng tỷ lệ nội địa hóa và khả năng tham gia chuỗi giá trị",
      "Chỉ phục vụ khu vực nông nghiệp",
      "Giảm liên kết giữa các doanh nghiệp"
    ],
    correctIndex: 1,
    explanation: "Công nghiệp hỗ trợ giúp tăng nội địa hóa, liên kết doanh nghiệp và nâng vị trí trong chuỗi giá trị."
  },
  {
    id: "q09",
    prompt: "Chuyển đổi số trong doanh nghiệp chủ yếu nhằm mục tiêu nào?",
    options: [
      "Chỉ thay giấy tờ bằng tệp điện tử",
      "Tái cấu trúc hoạt động dựa trên dữ liệu và công nghệ số",
      "Loại bỏ mọi lao động con người",
      "Chỉ mở thêm trang mạng xã hội"
    ],
    correctIndex: 1,
    explanation: "Chuyển đổi số là thay đổi mô hình vận hành, quản trị và tạo giá trị dựa trên dữ liệu và công nghệ."
  },
  {
    id: "q10",
    prompt: "Kinh tế xanh hướng tới sự kết hợp nào?",
    options: [
      "Tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường",
      "Tăng trưởng bằng mọi giá",
      "Chỉ bảo vệ môi trường và dừng sản xuất",
      "Chỉ ưu tiên lợi ích ngắn hạn"
    ],
    correctIndex: 0,
    explanation: "Kinh tế xanh hướng đến tăng trưởng hiệu quả, công bằng và giảm tác động tiêu cực đến môi trường."
  },
  {
    id: "q11",
    prompt: "Nguồn nhân lực chất lượng cao có vai trò gì trong hiện đại hóa?",
    options: [
      "Tiếp nhận, làm chủ và sáng tạo công nghệ",
      "Chỉ thực hiện lao động giản đơn",
      "Làm giảm năng suất lao động",
      "Thay thế hoàn toàn đầu tư công nghệ"
    ],
    correctIndex: 0,
    explanation: "Con người là chủ thể tiếp nhận, vận hành, cải tiến và sáng tạo công nghệ."
  },
  {
    id: "q12",
    prompt: "Tự chủ kinh tế không có nghĩa là gì?",
    options: [
      "Nâng năng lực nội sinh",
      "Đa dạng hóa đối tác và thị trường",
      "Đóng cửa, tách khỏi kinh tế thế giới",
      "Tăng khả năng chống chịu trước cú sốc"
    ],
    correctIndex: 2,
    explanation: "Tự chủ kinh tế không đồng nghĩa với khép kín; đó là năng lực nội sinh và khả năng hội nhập chủ động."
  },
  {
    id: "q13",
    prompt: "Hạ tầng logistics hiện đại tác động trực tiếp nhất đến yếu tố nào?",
    options: [
      "Tăng chi phí lưu thông",
      "Giảm hiệu quả chuỗi cung ứng",
      "Giảm chi phí và tăng tốc độ lưu chuyển hàng hóa",
      "Giảm khả năng kết nối vùng"
    ],
    correctIndex: 2,
    explanation: "Logistics hiện đại giúp giảm chi phí, thời gian và tăng độ tin cậy của chuỗi cung ứng."
  },
  {
    id: "q14",
    prompt: "Đổi mới sáng tạo trong doanh nghiệp được thể hiện rõ nhất qua hoạt động nào?",
    options: [
      "Giữ nguyên sản phẩm và quy trình trong thời gian dài",
      "Nghiên cứu, cải tiến sản phẩm, quy trình và mô hình kinh doanh",
      "Chỉ tăng số giờ làm",
      "Giảm đầu tư cho nhân lực"
    ],
    correctIndex: 1,
    explanation: "Đổi mới sáng tạo bao gồm cải tiến sản phẩm, quy trình, quản trị và mô hình kinh doanh."
  },
  {
    id: "q15",
    prompt: "Định hướng phát triển cân bằng trong trò chơi yêu cầu tập đoàn quan tâm điều gì?",
    options: [
      "Chỉ tối đa hóa vốn",
      "Chỉ tập trung vào công nghệ",
      "Đồng thời cân bằng kinh tế, công nghệ, tự chủ, công bằng và bền vững",
      "Bỏ qua tác động xã hội"
    ],
    correctIndex: 2,
    explanation: "Phát triển bền vững đòi hỏi cân bằng cả năm trụ cột, không chỉ tối đa hóa một chỉ số."
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
