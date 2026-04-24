import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { api } from '../api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ username: '', password: '' });
  const [focused, setFocused] = useState({ username: false, password: false });

  const onFinish = async () => {
    if (!values.username || !values.password) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(values);
      onLogin(res.data);
    } catch (e) {
      message.error(e.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-animation">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 className="title">NVDH</h1>
            <p className="subtitle">Quản lý hồ sơ lái xe</p>
          </div>

          <Form onFinish={onFinish} className="login-form">
            <div className={`input-group ${focused.username || values.username ? 'active' : ''}`}>
              <div className="input-icon">
                <UserOutlined />
              </div>
              <input
                type="text"
                value={values.username}
                onChange={(e) => setValues({ ...values, username: e.target.value })}
                onFocus={() => setFocused({ ...focused, username: true })}
                onBlur={() => setFocused({ ...focused, username: false })}
                placeholder=" "
                autoComplete="off"
              />
              <label>Tài khoản</label>
              <div className="input-line"></div>
            </div>

            <div className={`input-group ${focused.password || values.password ? 'active' : ''}`}>
              <div className="input-icon">
                <LockOutlined />
              </div>
              <input
                type="password"
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                onFocus={() => setFocused({ ...focused, password: true })}
                onBlur={() => setFocused({ ...focused, password: false })}
                placeholder=" "
              />
              <label>Mật khẩu</label>
              <div className="input-line"></div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </Form>

          <div className="card-footer">
            <div className="security-badge">
              <SafetyOutlined />
              <span>Kết nối bảo mật SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
