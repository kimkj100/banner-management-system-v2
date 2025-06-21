function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#10b981', marginBottom: '20px' }}>
          🎉 현수막 관리 시스템 테스트
        </h1>
        <p style={{ color: '#6b7280' }}>
          성공! 이제 본격적인 코드를 입력할 준비가 되었습니다!
        </p>
      </div>
    </div>
  );
}

export default App;
