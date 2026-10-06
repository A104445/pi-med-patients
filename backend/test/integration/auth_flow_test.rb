require "test_helper"

class AuthFlowTest < ActionDispatch::IntegrationTest
  def register(email: "ana@example.com", password: "password123")
    post "/api/v1/auth/register", params: { user: { name: "Ana", email: email, password: password } }, as: :json
  end

  def auth_header(token)
    { "Authorization" => "Bearer #{token}" }
  end

  test "registo devolve token e utilizador" do
    register
    assert_response :created
    body = response.parsed_body
    assert body["token"].present?
    assert_equal "ana@example.com", body.dig("user", "email")
  end

  test "registo com dados inválidos devolve erros" do
    register(email: "invalido", password: "x")
    assert_response :unprocessable_content
    assert response.parsed_body["errors"].key?("email")
  end

  test "login, me e logout" do
    register
    post "/api/v1/auth/login", params: { email: "ANA@example.com", password: "password123" }, as: :json
    assert_response :created
    token = response.parsed_body["token"]

    get "/api/v1/me", headers: auth_header(token)
    assert_response :ok
    assert_equal "Ana", response.parsed_body.dig("user", "name")

    delete "/api/v1/auth/logout", headers: auth_header(token)
    assert_response :no_content

    get "/api/v1/me", headers: auth_header(token)
    assert_response :unauthorized
  end

  test "login com palavra-passe errada falha" do
    register
    post "/api/v1/auth/login", params: { email: "ana@example.com", password: "errada123" }, as: :json
    assert_response :unauthorized
  end

  test "me sem token devolve 401" do
    get "/api/v1/me"
    assert_response :unauthorized
  end

  test "o token não é guardado em claro" do
    register
    token = response.parsed_body["token"]
    assert_nil Session.find_by(token_digest: token)
    assert Session.find_by_token(token)
  end
end
