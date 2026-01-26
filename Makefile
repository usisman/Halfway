SHELL := /bin/sh

ROOT_DIR := $(CURDIR)
API_DIR := $(ROOT_DIR)/apps/api
WEB_DIR := $(ROOT_DIR)/apps/web/public
WEB_PORT := 5173

PID_DIR := $(ROOT_DIR)/.pids
API_PID := $(PID_DIR)/api.pid
WEB_PID := $(PID_DIR)/web.pid
API_LOG := $(PID_DIR)/api.log
WEB_LOG := $(PID_DIR)/web.log

.PHONY: up down status

up:
	@mkdir -p "$(PID_DIR)"
	@if [ -f "$(API_PID)" ] && kill -0 $$(cat "$(API_PID)") 2>/dev/null; then \
		echo "API zaten calisiyor: http://localhost:3000"; \
	else \
		(cd "$(API_DIR)" && npm start > "$(API_LOG)" 2>&1 & echo $$! > "$(API_PID)"); \
		echo "API baslatildi: http://localhost:3000"; \
	fi
	@if [ -f "$(WEB_PID)" ] && kill -0 $$(cat "$(WEB_PID)") 2>/dev/null; then \
		echo "Web zaten calisiyor: http://localhost:$(WEB_PORT)"; \
	else \
		(cd "$(WEB_DIR)" && python3 -m http.server $(WEB_PORT) > "$(WEB_LOG)" 2>&1 & echo $$! > "$(WEB_PID)"); \
		echo "Web baslatildi: http://localhost:$(WEB_PORT)"; \
	fi

down:
	@if [ -f "$(API_PID)" ]; then \
		kill $$(cat "$(API_PID)") 2>/dev/null || true; \
		rm -f "$(API_PID)"; \
		echo "API durduruldu"; \
	else \
		echo "API calismiyor"; \
	fi
	@if [ -f "$(WEB_PID)" ]; then \
		kill $$(cat "$(WEB_PID)") 2>/dev/null || true; \
		rm -f "$(WEB_PID)"; \
		echo "Web durduruldu"; \
	else \
		echo "Web calismiyor"; \
	fi

status:
	@if [ -f "$(API_PID)" ] && kill -0 $$(cat "$(API_PID)") 2>/dev/null; then \
		echo "API calisiyor"; \
	else \
		echo "API calismiyor"; \
	fi
	@if [ -f "$(WEB_PID)" ] && kill -0 $$(cat "$(WEB_PID)") 2>/dev/null; then \
		echo "Web calisiyor"; \
	else \
		echo "Web calismiyor"; \
	fi
