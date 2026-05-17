import React, { useState } from 'react';
import { testService } from '../services/testService';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnections = async () => {
    setLoading(true);
    setStatus('🔍 Probando conexiones...');
    
    try {
      const result = await testService.testFullConnection();
      setStatus(result.summary);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Verificador de Conexiones - PeruMarket ERP</h1>
      
      <button 
        onClick={testConnections}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Probando...' : 'Probar Conexiones'}
      </button>

      {status && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #dee2e6',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>📋 Qué estamos verificando:</h3>
        <ul>
          <li>✅ Backend Spring Boot ejecutándose en puerto 8080</li>
          <li>✅ Base de datos MySQL conectada</li>
          <li>✅ Tablas existentes en la base de datos</li>
          <li>✅ CORS configurado para frontend React</li>
          <li>✅ Frontend puede comunicarse con backend</li>
        </ul>
      </div>
    </div>
  );
};

export default TestConnection;