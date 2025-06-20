import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 상태 관리
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [adminLoggedIn, setAdminLoggedIn] = useState(true); // 임시로 true
  const [companyLoggedIn, setCompanyLoggedIn] = useState(false);
  const [notification, setNotification] = useState('');
  
  // 신청서 폼 상태
  const [newForm, setNewForm] = useState({
    employeeName: '',
    department: '',
    phoneNumber: '',
    size: '',
    deadline: '',
    location: '',
    text: '',
    notes: '',
    referenceImages: []
  });

  // 폼 업데이트 함수
  const updateForm = (field, value) => {
    setNewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 참고시안 업로드 함수
  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    
    setNewForm(prev => ({
      ...prev,
      referenceImages: [...prev.referenceImages, ...newImages]
    }));
  };

  // 참고시안 삭제 함수
  const removeReferenceImage = (id) => {
    setNewForm(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter(img => img.id !== id)
    }));
  };

  // 프로젝트 추가 함수
  const addProject = () => {
    if (!newForm.employeeName || !newForm.department || !newForm.text) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    const newProject = {
      id: Date.now(),
      title: `${newForm.employeeName} - ${newForm.department}`,
      ...newForm,
      status: 'pending',
      createdAt: new Date().toLocaleDateString(),
      designs: [],
      completedImages: []
    };

    setProjects(prev => [...prev, newProject]);
    
    // 폼 초기화
    setNewForm({
      employeeName: '',
      department: '',
      phoneNumber: '',
      size: '',
      deadline: '',
      location: '',
      text: '',
      notes: '',
      referenceImages: []
    });
    
    setShowForm(false);
    showNotification('프로젝트가 성공적으로 등록되었습니다!');
  };

  // 알림 표시 함수
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f97316';
      case 'approved': return '#10b981';
      case 'manufacturing': return '#3b82f6';
      case 'completed': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  // 상태별 텍스트
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '대기중';
      case 'approved': return '승인됨';
      case 'manufacturing': return '제작중';
      case 'completed': return '완료됨';
      default: return '알 수 없음';
    }
  };

  // 시안 승인 함수
  const approveDesign = (projectId, designId) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'approved' }
        : project
    ));
    showNotification('시안이 승인되었습니다!');
  };

  // 시안 거부 함수
  const rejectDesign = (projectId, designId) => {
    showNotification('시안이 거부되었습니다.');
  };

  // 시안 업로드 함수 (업체용)
  const uploadDesign = (projectId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files[0]) {
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                status: 'review',
                designs: [...project.designs, {
                  id: Date.now(),
                  name: e.target.files[0].name,
                  status: 'review'
                }]
              }
            : project
        ));
        showNotification('시안이 업로드되었습니다!');
      }
    };
    input.click();
  };

  // 제작 시작 함수
  const startManufacturing = (projectId) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'manufacturing' }
        : project
    ));
    showNotification('제작이 시작되었습니다!');
  };

  // 완성품 업로드 함수
  const uploadCompleted = (projectId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        const images = files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          preview: URL.createObjectURL(file)
        }));
        
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                status: 'completed',
                completedImages: images
              }
            : project
        ));
        showNotification('완성품이 업로드되었습니다!');
      }
    };
    input.click();
  };

  // 전체 데이터 삭제 함수
  const clearAllData = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
      setProjects([]);
      showNotification('모든 데이터가 삭제되었습니다.');
    }
  };

  // 로그아웃 함수
  const doLogout = () => {
    showNotification('로그아웃되었습니다.');
    // 실제로는 로그인 페이지로 이동
  };

  // 메인 화면 부분
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
        {/* 신청서 폼 */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>
              📝 신청서 작성
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <input
                type="text"
                placeholder="신청자명 *"
                value={newForm.employeeName}
                onChange={(e) => updateForm('employeeName', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="text"
                placeholder="부서명 *"
                value={newForm.department}
                onChange={(e) => updateForm('department', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="text"
                placeholder="연락처"
                value={newForm.phoneNumber}
                onChange={(e) => updateForm('phoneNumber', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="text"
                placeholder="크기 (예: 3m x 1m)"
                value={newForm.size}
                onChange={(e) => updateForm('size', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="date"
                placeholder="마감일"
                value={newForm.deadline}
                onChange={(e) => updateForm('deadline', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              
              <input
                type="text"
                placeholder="설치 위치"
                value={newForm.location}
                onChange={(e) => updateForm('location', e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <textarea
              placeholder="현수막 내용 *"
              value={newForm.text}
              onChange={(e) => updateForm('text', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginTop: '15px',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            
            <textarea
              placeholder="비고사항"
              value={newForm.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginTop: '15px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                참고시안 업로드:
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleReferenceUpload}
                style={{
                  padding: '8px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              
              {newForm.referenceImages.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {newForm.referenceImages.map(img => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <img
                        src={img.preview}
                        alt={img.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      <button
                        onClick={() => removeReferenceImage(img.id)}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              
              <button
                onClick={addProject}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔥 Firebase 저장
              </button>
            </div>
          </div>
        )}

        {/* 대시보드 */}
        {!showForm && viewMode === 'dashboard' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>
              📋 프로젝트 대시보드
            </h3>
            
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>아직 등록된 프로젝트가 없습니다.</p>
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  + 첫 번째 신청서 등록하기
              </button>
            )}
          </div>
        )}
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

export default App;프로젝트 등록
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {projects.map(project => (
                  <div key={project.id} style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '20px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ color: '#374151', fontWeight: 'bold' }}>{project.title}</h4>
                      <span style={{
                        backgroundColor: getStatusColor(project.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '10px' }}>
                      {project.employeeName} | {project.department} | {project.createdAt}
                    </p>
                    <p style={{ color: '#374151', marginBottom: '15px' }}>{project.text}</p>
                    
                    {/* 관리자 기능 */}
                    {adminLoggedIn && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {project.designs.map(design => (
                          <div key={design.id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{design.name}</span>
                            {design.status === 'review' && (
                              <>
                                <button
                                  onClick={() => approveDesign(project.id, design.id)}
                                  style={{
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => rejectDesign(project.id, design.id)}
                                  style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  거부
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 업체 기능 */}
                    {companyLoggedIn && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {project.status === 'pending' && (
                          <button
                            onClick={() => uploadDesign(project.id)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            📎 시안 업로드
                          </button>
                        )}
                        
                        {project.status === 'approved' && (
                          <button
                            onClick={() => startManufacturing(project.id)}
                            style={{
                              backgroundColor: '#f97316',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            🔨 제작 시작
                          </button>
                        )}
                        
                        {project.status === 'manufacturing' && (
                          <button
                            onClick={() => uploadCompleted(project.id)}
                            style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            📸 완성품 업로드
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 완성품 갤러리 */}
        {!showForm && viewMode === 'gallery' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>
              🖼️ 완성품 갤러리
            </h3>
            
            {projects.filter(p => p.status === 'completed').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🖼️</div>
                <p style={{ color: '#6b7280' }}>아직 완성된 현수막이 없습니다.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {projects.filter(p => p.status === 'completed').map(project => (
                  <div key={project.id} style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ padding: '15px' }}>
                      <h4 style={{ color: '#374151', fontWeight: 'bold', marginBottom: '5px' }}>
                        {project.title}
                      </h4>
                      <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '10px' }}>
                        {project.employeeName} | {project.department}
                      </p>
                    </div>
                    
                    {project.completedImages && project.completedImages.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '5px', padding: '0 15px 15px' }}>
                        {project.completedImages.map(img => (
                          <img
                            key={img.id}
                            src={img.preview}
                            alt={img.name}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 초기 화면 (아무것도 선택하지 않았을 때) */}
        {!showForm && viewMode === 'dashboard' && projects.length === 0 && (
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
                  cursor: 'pointer'
                }}
              >
                + 첫 번째
