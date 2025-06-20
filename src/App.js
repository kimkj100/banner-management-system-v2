import React, { useState } from 'react';

export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [companyLoggedIn, setCompanyLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');

  // 알림 표시
  const showMessage = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // 로그인
  const doLogin = () => {
    if (userId === 'admin' && password === 'admin123') {
      setAdminLoggedIn(true);
      showMessage('관리자 로그인 성공!');
    } else if (userId === 'company' && password === 'company123') {
      setCompanyLoggedIn(true);
      showMessage('업체 로그인 성공!');
    } else {
      showMessage('로그인 실패!');
    }
    setUserId('');
    setPassword('');
  };

  // 로그아웃
  const doLogout = () => {
    setAdminLoggedIn(false);
    setCompanyLoggedIn(false);
  };

  // 로그인 화면
  if (!adminLoggedIn && !companyLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '350px',
          width: '100%',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '50px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>🏢</div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#10b981',
            textAlign: 'center',
            marginBottom: '15px'
          }}>현수막 관리 시스템 v2</h1>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '10px'
          }}>신청서 관리 및 업체 연결 플랫폼</p>

          <div style={{
            fontSize: '12px',
            color: '#10b981',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: 'bold',
            backgroundColor: '#ecfdf5',
            padding: '8px',
            borderRadius: '8px'
          }}>
            🔥 기본 버전 (Firebase 연결 준비 완료)
          </div>
          
          <input
            type="text"
            placeholder="사용자 ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '16px',
              marginBottom: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '16px',
              marginBottom: '20px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          
          <button
            onClick={doLogin}
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            로그인
          </button>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ marginBottom: '5px' }}>👨‍💼 관리자: admin / admin123</div>
            <div>🏭 업체: company / company123</div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#10b981', 
          marginBottom: '15px' 
        }}>
          환영합니다! {adminLoggedIn ? '관리자' : '업체'}님
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          기본 로그인이 성공했습니다!<br/>
          이제 Firebase를 연결해서 완전한 시스템을 만들어보겠습니다.
        </p>
        <button
          onClick={doLogout}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          borderRadius: '10px',
          backgroundColor: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 1000,
          fontSize: '14px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {notification}
        </div>
      )}
    </div>
  );
}
