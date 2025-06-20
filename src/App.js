import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, onValue, off } from 'firebase/database';

export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [companyLoggedIn, setCompanyLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase에서 실시간 데이터 읽기
  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase 객체를 배열로 변환
        const projectsArray = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => off(projectsRef, 'value', unsubscribe);
  }, []);

  // Firebase에 데이터 저장
  const saveToFirebase = async (updatedProjects) => {
    try {
      // 배열을 객체로 변환 (Firebase는 배열보다 객체를 선호)
      const projectsObject = {};
      updatedProjects.forEach(project => {
        const key = project.firebaseKey || project.id;
        projectsObject[key] = {
          ...project,
          firebaseKey: undefined // firebaseKey는 저장하지 않음
        };
      });
      
      await set(ref(database, 'projects'), projectsObject);
      showMessage('🔥 Firebase에 실시간 저장 완료!');
    } catch (error) {
      console.error('Firebase 저장 실패:', error);
      showMessage('❌ 저장 실패: ' + error.message);
    }
  };

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
    setShowForm(false);
    setViewMode('dashboard');
    resetForm();
  };

  // 폼 상태
  const [newForm, setNewForm] = useState({
    employeeName: '',
    department: '',
    phoneNumber: '',
    text: '',
    size: '',
    deadline: '',
    location: '',
    notes: '',
    referenceImages: []
  });

  // 폼 업데이트
  const updateForm = (field, value) => {
    setNewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 폼 리셋
  const resetForm = () => {
    setNewForm({
      employeeName: '',
      department: '',
      phoneNumber: '',
      text: '',
      size: '',
      deadline: '',
      location: '',
      notes: '',
      referenceImages: []
    });
  };

  // 참고시안 업로드
  const handleReferenceUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            id: Date.now() + i,
            name: file.name,
            preview: event.target.result,
            file: file
          };
          setNewForm(prev => ({
            ...prev,
            referenceImages: [...prev.referenceImages, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  // 참고시안 삭제
  const removeReferenceImage = (imageId) => {
    setNewForm(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter(img => img.id !== imageId)
    }));
  };

  // 신청서 등록
  const addProject = () => {
    if (!newForm.employeeName.trim() || !newForm.department.trim() || !newForm.text.trim()) {
      showMessage('필수 정보를 입력해주세요!');
      return;
    }
    
    const newProject = {
      id: 'REQ-' + Date.now().toString().slice(-6),
      ...newForm,
      title: `${newForm.employeeName} 현수막`,
      status: 'pending',
      designs: [],
      completedImages: [],
      createdAt: new Date().toLocaleString()
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveToFirebase(updatedProjects);
    setShowForm(false);
    resetForm();
    showMessage('🔥 신청서가 Firebase에 저장되었습니다!');
  };

  // 업체: 시안 업로드
  const uploadDesign = (projectId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf';
    input.onchange = function(e) {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          const newDesigns = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            
            if (isImage || isPDF) {
              const newDesign = {
                id: Date.now() + i,
                name: file.name,
                status: 'review',
                type: isImage ? 'image' : 'pdf',
                uploadedAt: new Date().toLocaleString()
              };
              
              if (isImage) {
                const reader = new FileReader();
                reader.onload = function(event) {
                  newDesign.preview = event.target.result;
                };
                reader.readAsDataURL(file);
              }
              
              newDesigns.push(newDesign);
            }
          }
          
          return {
            ...project,
            designs: [...project.designs, ...newDesigns],
            status: 'design_uploaded'
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      saveToFirebase(updatedProjects);
      showMessage(`🔥 ${files.length}개 시안이 Firebase에 저장되었습니다!`);
    };
    input.click();
  };

  // 관리자: 시안 승인
  const approveDesign = (projectId, designId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedDesigns = project.designs.map(design => {
          if (design.id === designId) {
            return { ...design, status: 'approved' };
          }
          return design;
        });
        return {
          ...project,
          designs: updatedDesigns,
          status: 'approved'
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    saveToFirebase(updatedProjects);
    showMessage('🔥 시안 승인이 Firebase에 저장되었습니다!');
  };

  // 관리자: 시안 거부
  const rejectDesign = (projectId, designId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedDesigns = project.designs.map(design => {
          if (design.id === designId) {
            return { ...design, status: 'rejected' };
          }
          return design;
        });
        return { ...project, designs: updatedDesigns };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    saveToFirebase(updatedProjects);
    showMessage('🔥 수정 요청이 Firebase에 저장되었습니다!');
  };

  // 업체: 제작 시작
  const startManufacturing = (projectId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, status: 'manufacturing' };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    saveToFirebase(updatedProjects);
    showMessage('🔥 제작 시작이 Firebase에 저장되었습니다!');
  };

  // 업체: 완성품 업로드
  const uploadCompleted = (projectId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = function(e) {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          const newImages = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
              const newImage = {
                id: Date.now() + i,
                name: file.name,
                uploadedAt: new Date().toLocaleString()
              };
              
              const reader = new FileReader();
              reader.onload = function(event) {
                newImage.preview = event.target.result;
              };
              reader.readAsDataURL(file);
              
              newImages.push(newImage);
            }
          }
          
          return {
            ...project,
            completedImages: [...project.completedImages, ...newImages],
            status: 'completed'
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      saveToFirebase(updatedProjects);
      showMessage(`🔥 ${files.length}개 완성사진이 Firebase에 저장되었습니다!`);
    };
    input.click();
  };

  // 데이터 전체 삭제
  const clearAllData = () => {
    if (window.confirm('⚠️ 정말 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다!')) {
      const emptyProjects = [];
      setProjects(emptyProjects);
      saveToFirebase(emptyProjects);
      showMessage('🗑️ 모든 데이터가 Firebase에서 삭제되었습니다!');
    }
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'design_uploaded': return '#3b82f6';
      case 'approved': return '#8b5cf6';
      case 'manufacturing': return '#f97316';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '시안 대기';
      case 'design_uploaded': return '시안 검토';
      case 'approved': return '승인 완료';
      case 'manufacturing': return '제작중';
      case 'completed': return '완성';
      default: return '대기중';
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '50px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔥</div>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Firebase v2 연결 중...</h2>
          <p style={{ color: '#6b7280' }}>실시간 데이터베이스에서 데이터를 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

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
            🔥 Firebase v2 실시간 동기화<br/>
            📊 저장된 프로젝트: {projects.length}개
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

  // 메인 화면 (계속...)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#10b981',
            margin: 0
          }}>
            현수막 관리 시스템 v2 {adminLoggedIn ? '(관리자)' : '(업체)'}
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '2px 0 0 0'
          }}>
            🔥 총 {projects.length}개 프로젝트 Firebase v2 실시간 동기화
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {adminLoggedIn && (
            <>
              <button
                onClick={() => setViewMode('dashboard')}
                style={{
                  backgroundColor: viewMode === 'dashboard' ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📋 대시보드
              </button>
              
              <button
                onClick={() => setViewMode('gallery')}
                style={{
                  backgroundColor: viewMode === 'gallery' ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🖼️ 완성품 갤러리
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + 신청서 입력
              </button>

              <button
                onClick={clearAllData}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🗑️ 전체삭제
              </button>
            </>
          )}
          
          <button
            onClick={doLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#10b981', 
            marginBottom: '15px' 
          }}>
            Firebase v2 연결 성공!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            현수막 관리 시스템이 Firebase와 성공적으로 연결되었습니다!<br/>
            이제 모든 데이터가 실시간으로 동기화됩니다.
          </p>
          <div style={{
            backgroundColor: '#ecfdf5',
            padding: '15px',
            borderRadius: '10px',
            color: '#10b981',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            📊 현재 저장된 프로젝트: {projects.length}개<br/>
            🔥 실시간 Firebase 동기화 활성화
          </div>
          {adminLoggedIn && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              + 첫 번째 신청서 등록하기
            </button>
          )}
        </div>
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
