// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './CreateUserPage.css';

// const CreateUserPage = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // Regex for strong password and valid email
//   const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   const handleCreateUser = (event) => {
//     event.preventDefault();

//     // Check if password meets strength requirements
//     if (!strongPasswordRegex.test(password)) {
//       setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
//       return;
//     }

//     // Check if email is valid
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address.');
//       return;
//     }

//     const userData = {
//       username,
//       password,
//       email,
//       name,
//     };

//     fetch('http://127.0.0.1:5000/api/create-user', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(userData),
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           navigate('/login');
//         } else {
//           setError('Failed to create user');
//         }
//       })
//       .catch(() => {
//         setError('Failed to create user');
//       });
//   };

//   return (
//     <div className="create-user-page">
//       <h1 className="title">Create User</h1>
//       <form onSubmit={handleCreateUser}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         {error && <p className="error">{error}</p>}
//         <button type="submit" className="create-button">Create</button>
//       </form>
//     </div>
//   );
// };

// export default CreateUserPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUserPage.css';

const CreateUserPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Regex for strong password and valid email
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleCreateUser = (event) => {
    event.preventDefault();

    // Check if password meets strength requirements
    if (!strongPasswordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    // Check if email is valid
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const userData = {
      username,
      password,
      email,
      name,
    };

    fetch('http://127.0.0.1:5000/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigate('/login');
        } else {
          setError('Failed to create user');
        }
      })
      .catch(() => {
        setError('Failed to create user');
      });
  };

  return (
    <div className="create-user-page">
      <div className="create-user-container">
        <h1 className="title">Sign Up</h1>
        <form onSubmit={handleCreateUser}>
        <div className="password-requirements">
            <h2>Password Requirements</h2>
            <ul>
              <li>At least 8 characters long</li>
              <li>Includes at least one uppercase letter</li>
              <li>Includes at least one lowercase letter</li>
              <li>Includes at least one number</li>
              <li>Includes at least one special character (e.g., @, $, !)</li>
            </ul>
          </div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="create-button">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
