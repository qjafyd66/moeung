export type Brand = {
  id: string;
  name: string;
  category: string;
  color: string;
  logoUrl: string;
};

export const BRANDS: Brand[] = [
  // 자동차 - 국내
  { id: "hyundai", name: "현대자동차", category: "car", color: "#002C5F", logoUrl: "https://cdn.simpleicons.org/hyundai/002C5F" },
  { id: "kia", name: "기아", category: "car", color: "#05141F", logoUrl: "https://cdn.simpleicons.org/kia/05141F" },
  { id: "genesis", name: "제네시스", category: "car", color: "#000000", logoUrl: "https://cdn.simpleicons.org/genesis/000000" },
  // 자동차 - 수입
  { id: "tesla", name: "테슬라", category: "car", color: "#CC0000", logoUrl: "https://cdn.simpleicons.org/tesla/CC0000" },
  { id: "bmw", name: "BMW", category: "car", color: "#1C69D4", logoUrl: "https://cdn.simpleicons.org/bmw/1C69D4" },
  { id: "mercedes", name: "메르세데스-벤츠", category: "car", color: "#222222", logoUrl: "https://cdn.simpleicons.org/mercedes/222222" },
  { id: "audi", name: "아우디", category: "car", color: "#BB0A30", logoUrl: "https://cdn.simpleicons.org/audi/BB0A30" },
  { id: "volvo", name: "볼보", category: "car", color: "#003057", logoUrl: "https://cdn.simpleicons.org/volvo/003057" },
  { id: "porsche", name: "포르쉐", category: "car", color: "#D5001C", logoUrl: "https://cdn.simpleicons.org/porsche/D5001C" },
  { id: "toyota", name: "토요타", category: "car", color: "#EB0A1E", logoUrl: "https://cdn.simpleicons.org/toyota/EB0A1E" },
  { id: "lexus", name: "렉서스", category: "car", color: "#1A1A1A", logoUrl: "https://cdn.simpleicons.org/lexus/1A1A1A" },
  { id: "volkswagen", name: "폭스바겐", category: "car", color: "#151F5D", logoUrl: "https://cdn.simpleicons.org/volkswagen/151F5D" },
  // 치킨
  { id: "bbq", name: "BBQ", category: "chicken", color: "#FF2222", logoUrl: "" },
  { id: "bhc", name: "BHC", category: "chicken", color: "#FF6600", logoUrl: "" },
  { id: "kyochon", name: "교촌치킨", category: "chicken", color: "#8B0000", logoUrl: "" },
  { id: "goobne", name: "굽네치킨", category: "chicken", color: "#E8402A", logoUrl: "" },
  { id: "60chicken", name: "60계치킨", category: "chicken", color: "#E88A00", logoUrl: "" },
  { id: "puradak", name: "푸라닭", category: "chicken", color: "#1A1A2E", logoUrl: "" },
  { id: "nene", name: "네네치킨", category: "chicken", color: "#FF0000", logoUrl: "" },
  { id: "norang", name: "노랑통닭", category: "chicken", color: "#FFB900", logoUrl: "" },
  { id: "mexicana", name: "멕시카나", category: "chicken", color: "#228B22", logoUrl: "" },
  { id: "pelicana", name: "페리카나", category: "chicken", color: "#CC0000", logoUrl: "" },
  { id: "momstouch", name: "맘스터치", category: "chicken", color: "#E8291C", logoUrl: "" },
  { id: "chickenmaru", name: "치킨마루", category: "chicken", color: "#7B3F00", logoUrl: "" },
  { id: "jadam", name: "자담치킨", category: "chicken", color: "#FF4500", logoUrl: "" },
  { id: "cheogajip", name: "처갓집", category: "chicken", color: "#DC143C", logoUrl: "" },
  { id: "jicoba", name: "지코바", category: "chicken", color: "#D62B2B", logoUrl: "" },
  { id: "ddoraeorae", name: "또래오래", category: "chicken", color: "#FF6B00", logoUrl: "" },
  { id: "kkanbul", name: "깐부치킨", category: "chicken", color: "#FF3B30", logoUrl: "" },
  { id: "hoolala", name: "훌랄라", category: "chicken", color: "#E84118", logoUrl: "" },
  { id: "barun", name: "바른치킨", category: "chicken", color: "#27AE60", logoUrl: "" },
  { id: "hoodak", name: "후라이드참잘하는집", category: "chicken", color: "#C0392B", logoUrl: "" },
  // 가전
  { id: "samsung", name: "삼성전자", category: "appliance", color: "#1428A0", logoUrl: "https://cdn.simpleicons.org/samsung/1428A0" },
  { id: "lg", name: "LG전자", category: "appliance", color: "#A50034", logoUrl: "https://cdn.simpleicons.org/lg/A50034" },
  { id: "apple", name: "애플", category: "appliance", color: "#000000", logoUrl: "https://cdn.simpleicons.org/apple/000000" },
  { id: "dyson", name: "다이슨", category: "appliance", color: "#C8A951", logoUrl: "https://cdn.simpleicons.org/dyson/C8A951" },
];

export const getBrandById = (id: string) => BRANDS.find((b) => b.id === id);
export const getBrandByName = (name: string) => BRANDS.find((b) => b.name === name);
export const getBrandsByCategory = (category: string) =>
  BRANDS.filter((b) => b.category === category);
