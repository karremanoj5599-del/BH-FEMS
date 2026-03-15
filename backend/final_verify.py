import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_login_and_me():
    print("Testing Login...")
    login_data = {"email": "admin@fems.com", "password": "admin123"}
    r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if r.status_code != 200:
        print(f"Login failed! Status: {r.status_code}, Detail: {r.text}")
        return

    tokens = r.json()
    access_token = tokens["access_token"]
    print("Login successful.")

    print("Testing /auth/me...")
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if r.status_code == 200:
        print(f"Me successful. Name: {r.json().get('name')}")
    else:
        print(f"Me failed! Status: {r.status_code}, Detail: {r.text}")

if __name__ == "__main__":
    test_login_and_me()
