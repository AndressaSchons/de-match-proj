import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: Busca os usuários no Supabase
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM usuario ORDER BY id_user DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Insere um novo usuário
export async function POST(request) {
  try {
    const data = await request.json();
    const query = `
      INSERT INTO usuario (nome_user, login, senha, perfil_acesso, dt_competencia)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
    `;
    const values = [data.nome_user, data.login, data.senha, data.perfil_acesso];
    const result = await pool.query(query, values);
    return NextResponse.json({ message: 'Usuário criado!', usuario: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Atualiza um usuário existente
export async function PUT(request) {
  try {
    const data = await request.json();
    const query = `
      UPDATE usuario 
      SET nome_user = $1, login = $2, senha = $3, perfil_acesso = $4
      WHERE id_user = $5 RETURNING *;
    `;
    // Passamos o id_user no final (variável $5)
    const values = [data.nome_user, data.login, data.senha, data.perfil_acesso, data.id_user];
    const result = await pool.query(query, values);
    return NextResponse.json({ message: 'Usuário atualizado!', usuario: result.rows[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Apaga um usuário
export async function DELETE(request) {
  try {
    const data = await request.json();
    const query = 'DELETE FROM usuario WHERE id_user = $1 RETURNING *;';
    await pool.query(query, [data.id_user]);
    return NextResponse.json({ message: 'Usuário deletado com sucesso!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}