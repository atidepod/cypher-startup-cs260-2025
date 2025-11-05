import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
//import { Login } from './login/login';
import { About } from '../about/about.jsx';
import { Message } from '../message/message.jsx';
import '../app.css'

export function Login() {
  return (
    <main className="container">
      <div className="login-container">
        <div className="login-card">
          <h2>Login to Cypher</h2>
          <form>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Username" required=""
                data-ddg-inputtype="credentials.username"></input>
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="Password" required=""
                data-ddg-inputtype="credentials.password.current"></input>
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          <p className="mt-3">Welcome back! Please enter your password</p>
        </div>
      </div>
    </main>
  );
}