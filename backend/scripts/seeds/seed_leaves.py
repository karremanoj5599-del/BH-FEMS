
import sqlite3

def seed():
    conn = sqlite3.connect('fems_dev.db')
    cursor = conn.cursor()

    leave_types = [
        ('Casual Leave', 12, 'var(--primary-400)'),
        ('Sick Leave', 10, 'var(--success-400)'),
        ('Earned Leave', 18, 'var(--warning-400)'),
        ('Comp-off', 5, 'var(--danger-400)')
    ]

    for name, quota, color in leave_types:
        try:
            cursor.execute("INSERT INTO leave_types (name, entitlement, color) VALUES (?, ?, ?)", (name, quota, color))
            print(f"Added {name}")
        except sqlite3.IntegrityError:
            # Update existing if needed
            cursor.execute("UPDATE leave_types SET color = ? WHERE name = ?", (color, name))
            print(f"Updated {name}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed()
