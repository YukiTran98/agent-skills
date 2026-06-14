# Manual setup

Dùng khi không muốn chạy `setup.sh`.

```bash
# 1. Cài deps
npm install

# 2. Link CLI — user-local (không cần sudo)
npm config set prefix ~/.local   # 1 lần trên máy
npm link                          # tạo ~/.local/bin/skh

# Thêm vào PATH nếu chưa có:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

# Hoặc dùng sudo:
# sudo npm link

# 3. Init config
skh init
```
