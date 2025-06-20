import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBrfqdS5Nt_NM4ZSS1-4ZJnK5LZPZtcdFf4",
  authDomain: "banner-management-v2.firebaseapp.com",
  databaseURL: "https://banner-management-v2-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "banner-management-v2",
  storageBucket: "banner-management-v2.firebasestorage.app",
  messagingSenderId: "763331198230",
  appId: "1:763331198230:web:93f15544b7a1f13d2fa437"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 데이터베이스 연결
const database = getDatabase(app);

export { database };
