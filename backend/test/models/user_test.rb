require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normaliza o email" do
    user = User.create!(name: "Ana", email: "  Ana@Example.COM ", password: "password123")
    assert_equal "ana@example.com", user.email
  end

  test "exige palavra-passe com pelo menos 8 caracteres" do
    user = User.new(name: "Ana", email: "ana@example.com", password: "curta")
    assert_not user.valid?
    assert user.errors[:password].any?
  end

  test "não expõe o password_digest em JSON" do
    user = User.create!(name: "Ana", email: "ana@example.com", password: "password123")
    assert_not user.as_json.key?(:password_digest)
  end
end
