import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AddUsers = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Eklenecek kullanıcılar
  const users = [
    { email: 'admin@corpbank.com', password: 'Admin123!' },
    { email: 'analyst@corpbank.com', password: 'Analyst123!' },
    { email: 'security@corpbank.com', password: 'Security123!' },
    { email: 'monitor@corpbank.com', password: 'Monitor123!' },
  ];

  const handleAddUsers = async () => {
    setLoading(true);
    setResults([]);

    const newResults = [];

    for (const user of users) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        newResults.push({
          email: user.email,
          status: 'success',
          uid: userCredential.user.uid,
          message: 'Kullanıcı başarıyla eklendi'
        });
      } catch (error) {
        let message = 'Bilinmeyen hata';
        if (error.code === 'auth/email-already-in-use') {
          message = 'Bu e-posta zaten kullanılıyor';
        } else if (error.code === 'auth/weak-password') {
          message = 'Şifre çok zayıf';
        } else {
          message = error.message;
        }
        
        newResults.push({
          email: user.email,
          status: 'error',
          message: message
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="bg-siem-card border border-siem-border rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Firebase Kullanıcı Ekleme</h2>
      
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-4">
          Aşağıdaki kullanıcıları Firebase Authentication'a ekleyeceksiniz:
        </p>
        <div className="bg-siem-bg rounded-lg p-4 space-y-2">
          {users.map((user, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{user.email}</span>
              <span className="text-gray-500 font-mono">{user.password}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleAddUsers}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Ekleniyor...</span>
          </>
        ) : (
          <span>Kullanıcıları Ekle</span>
        )}
      </button>

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-white mb-3">Sonuçlar:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'success' ? (
                  <CheckCircle className="text-green-500 mt-0.5" size={20} />
                ) : (
                  <XCircle className="text-red-500 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">{result.email}</p>
                  <p className={`text-sm mt-1 ${
                    result.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.message}
                  </p>
                  {result.uid && (
                    <p className="text-xs text-gray-500 mt-1">UID: {result.uid}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddUsers;

