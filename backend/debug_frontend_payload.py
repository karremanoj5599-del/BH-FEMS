import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_add_employee_mimic_frontend():
    # 1. Login
    login_data = {"email": "admin@fems.com", "password": "adminpassword"}
    res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Mimic Frontend formData
    form_data = {
        "employee_id": "EMP-FINAL-100",
        "name": "Final Debug User",
        "email": "final_debug_v2@fems.com",
        "password": "password123",
        "phone": "",
        "designation": "",
        "status": "Active",
        "type": "Permanent",
        "department_id": "3",
        "team_id": "2",
        "role_id": "5",
        "address": ""
    }

    # 3. Mimic handleSave sanitization
    payload = form_data.copy()
    id_fields = ['department_id', 'team_id', 'role_id', 'supervisor_id']
    for field in id_fields:
        val = payload.get(field)
        if val == '' or val is None:
            payload[field] = None
        else:
            payload[field] = int(val)
    
    # Optional strings
    if payload.get("phone") == '': payload["phone"] = None
    if payload.get("designation") == '': payload["designation"] = None
    if payload.get("address") == '': payload["address"] = None

    print(f"Sending payload: {payload}")
    res = requests.post(f"{BASE_URL}/employees/", json=payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.json()}")

if __name__ == "__main__":
    test_add_employee_mimic_frontend()
