"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    role: 'Elev', // Standardvalg
    password: ''
  });

  const roles = ['Lærer', 'Elev'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Login data indsendt:', formData);
    // Håndter login-logik her
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-primary/60">
          login
        </p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Vælg Rolle (Radio Buttons) */}
          <div>
            <span className="block text-sm font-medium text-primary mb-2">
              Vælg rolle
            </span>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <label
                  key={role}
                  className={`flex cursor-pointer items-center justify-center rounded-md border p-3 text-sm font-medium transition-all ${
                    formData.role === role
                      ? 'border-success bg-box-bg text-success'
                      : 'border-primary bg-box-bg text-primary hover:border-secondary hover:text-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="sr-only" // Skjuler standard radio-cirkel til fordel for knap-styling
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {/* Skolens navn */}
          <div>
            <label htmlFor="skolens-navn" className="block text-sm font-medium text-primary">
              Skolens navn
            </label>
            <input
              type="text"
              id="skolens-navn"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              className="mt-2 block h-10 w-full rounded-md shadow-sm sm:text-sm backdrop-blur-sm border border-primary bg-box-bg px-3 text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 block h-10 w-full rounded-md shadow-sm sm:text-sm backdrop-blur-sm border border-primary bg-box-bg px-3 text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Submit Knap */}
          <button
            type="submit"
            className="w-full rounded-md bg-accent-blue-background py-2.5 px-4 text-bg-primary font-medium hover:bg-accent-blue  transition-colors cursor-pointer"
          >
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}