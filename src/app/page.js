"use client";
import { useState, useEffect } from 'react';

export default function UsuariosCRUD() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nome_user: '',
    login: '',
    senha: '',
    perfil_acesso: 'Comum'
  });
  
  // Controle para saber se estamos criando ou editando
  const [editingId, setEditingId] = useState(null);

  const fetchUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submissão do Formulário (Serve tanto para Criar quanto para Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Se tivermos um ID em edição, usamos PUT
      await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_user: editingId }) // Enviamos o ID junto
      });
      setEditingId(null); // Limpa o modo de edição
    } else {
      // Se não tiver ID, usamos POST para criar
      await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }

    // Limpa o form e atualiza a lista
    setFormData({ nome_user: '', login: '', senha: '', perfil_acesso: 'Comum' });
    fetchUsuarios();
  };

  // Prepara o formulário para edição
  const handleEdit = (user) => {
    setFormData({
      nome_user: user.nome_user,
      login: user.login,
      senha: user.senha,
      perfil_acesso: user.perfil_acesso
    });
    setEditingId(user.id_user);
  };

  // Cancela a edição e limpa o formulário
  const handleCancelEdit = () => {
    setFormData({ nome_user: '', login: '', senha: '', perfil_acesso: 'Comum' });
    setEditingId(null);
  };

  // Chama a rota de DELETE passando o ID
  const handleDelete = async (id_user) => {
    if (confirm('Tem certeza que deseja apagar este usuário?')) {
      await fetch('/api/usuarios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user })
      });
      fetchUsuarios();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>{editingId ? 'Editar Usuário' : 'Cadastro de Usuário'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" name="nome_user" placeholder="Nome Completo" 
          value={formData.nome_user} onChange={handleChange} required 
        />
        <input 
          type="text" name="login" placeholder="Login" 
          value={formData.login} onChange={handleChange} required 
        />
        <input 
          type="password" name="senha" placeholder="Senha" 
          value={formData.senha} onChange={handleChange} required={!editingId} // Senha só é obrigatória ao criar
        />
        <select name="perfil_acesso" value={formData.perfil_acesso} onChange={handleChange}>
          <option value="Comum">Comum</option>
          <option value="Administrador">Administrador</option>
        </select>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px', cursor: 'pointer', flex: 1, backgroundColor: editingId ? '#eab308' : '#3b82f6', color: 'white', border: 'none' }}>
            {editingId ? 'Atualizar Usuário' : 'Salvar Novo Usuário'}
          </button>
          
          {/* Botão de cancelar só aparece quando estivermos editando */}
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#9ca3af', color: 'white', border: 'none' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <hr style={{ marginBottom: '20px' }}/>

      <h3>Usuários Cadastrados</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {usuarios.map((user) => (
          <li key={user.id_user} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{user.nome_user}</strong> ({user.login}) <br/>
              <small>Perfil: {user.perfil_acesso}</small>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleEdit(user)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#eab308', color: 'white', border: 'none' }}>Editar</button>
              <button onClick={() => handleDelete(user.id_user)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>Apagar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}