import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CourseList from "./pages/CourseList";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";

function RequireAuth({ children }: { children: React.ReactElement }) {
  return localStorage.getItem("token") ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <CourseList />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id/quiz"
          element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id/result"
          element={
            <RequireAuth>
              <Result />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
