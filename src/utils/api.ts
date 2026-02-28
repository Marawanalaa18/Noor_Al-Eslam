import axios from 'axios';

export const aladhanApi = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
});

export const alquranApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
});

export const quranAudioBaseUrl = 'https://everyayah.com/data';

export const islamicApi = axios.create({
  baseURL: 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main',
});

