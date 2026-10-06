# Dados de desenvolvimento. Correr com `bin/rails db:seed` (idempotente).
# Também corre automaticamente no `bin/rails db:prepare` quando a base de dados é criada.

if Rails.env.development?
  demo = User.find_or_initialize_by(email: "demo@medgical.ai")
  demo.update!(name: "Serafim Saudade", password: "demo1234")
end
