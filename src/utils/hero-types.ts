export interface Pin {
  id: string;
  url: string;
  title: string;
  height: string;
  color: string;
}

export  interface HeroTheme {
  keyword: string;
  color: string;
  pins: Pin[];
}


