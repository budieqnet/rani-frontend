/*!
 * RANI Chat Widget
 * Universitas: Pengadilan Agama Medan
 * Version: 1.0.0
 */

(function() {
    'use strict';

    var RaniWidget = {
        config: {
            apiUrl: window.RANI_API_URL || '/api/rani',
            sessionId: null,
            position: 'right',
            theme: 'green'
        },

        init: function(options) {
            this.config = Object.assign(this.config, options || {});
            this.sessionId = this.config.sessionId || 'rani-' + Math.random().toString(36).substr(2, 9);
            this.injectStyles();
            this.createUI();
            this.bindEvents();
        },

        injectStyles: function() {
            if (document.getElementById('rani-widget-styles')) return;
            
            var styles = document.createElement('style');
            styles.id = 'rani-widget-styles';
            styles.textContent = RaniWidget.getStyles();
            document.head.appendChild(styles);

            // Inject marked.js if not present
            if (!window.marked) {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
                document.head.appendChild(script);
            }
        },

        getStyles: function() {
            return `
                #rani-widget-btn { position: fixed; bottom: 20px; ` + (this.config.position === 'left' ? 'left' : 'right') + `: 20px; width: 60px; height: 60px; background: linear-gradient(135deg, #00695c 0%, #439889 100%); border-radius: 50%; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 105, 92, 0.4); z-index: 999999; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
                #rani-widget-btn:hover { transform: scale(1.1); }
                #rani-widget-btn svg { width: 30px; height: 30px; fill: white; }
                #rani-chat-popup { position: fixed; bottom: 90px; ` + (this.config.position === 'left' ? 'left' : 'right') + `: 20px; width: 380px; height: 520px; max-width: calc(100vw - 40px); max-height: calc(100vh - 120px); background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); z-index: 999999; display: none; flex-direction: column; overflow: hidden; }
                #rani-chat-popup.active { display: flex; }
                #rani-header { background: linear-gradient(135deg, #00695c 0%, #439889 100%); color: white; padding: 16px; display: flex; align-items: center; gap: 12px; }
                #rani-avatar { width: 44px; height: 44px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: none; align-items: center; justify-content: center; font-size: 24px; }
                #rani-info h3 { font-size: 18px; font-weight: 600; margin: 0; }
                #rani-info p { font-size: 12px; opacity: 0.9; margin: 0; display: none; }
                #rani-close { margin-left: auto; background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 18px; }
                #rani-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f5f7fa; }
                .rani-message { margin-bottom: 12px; animation: rani-fadeIn 0.3s; }
                @keyframes rani-fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .rani-message.user { text-align: right; }
                .rani-message.user .message-bubble { background: linear-gradient(135deg, #00695c 0%, #439889 100%); color: white; border-radius: 18px 18px 4px 18px; }
                .rani-message.rani .message-bubble { background: white; color: #333; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
                .message-bubble { display: inline-block; padding: 12px 16px; max-width: 85%; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
                .message-bubble p { margin-bottom: 8px; }
                .message-bubble p:last-child { margin-bottom: 0; }
                .message-bubble ul, .message-bubble ol { margin-left: 20px; margin-bottom: 8px; }
                .message-bubble li { margin-bottom: 4px; }
                .message-bubble strong { font-weight: 700; }
                .rani-typing { display: flex; gap: 4px; padding: 12px 16px; }
                .rani-typing span { width: 8px; height: 8px; background: #00695c; border-radius: 50%; animation: rani-bounce 1.4s infinite ease-in-out both; }
                .rani-typing span:nth-child(1) { animation-delay: -0.32s; }
                .rani-typing span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes rani-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                #rani-input-area { padding: 12px; background: white; border-top: 1px solid #eee; display: flex; gap: 8px; }
                #rani-input { flex: 1; padding: 12px 16px; border: 1px solid #ddd; border-radius: 24px; font-size: 14px; outline: none; }
                #rani-input:focus { border-color: #00695c; }
                #rani-send { width: 44px; height: 44px; background: linear-gradient(135deg, #00695c 0%, #439889 100%); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                #rani-send:hover { transform: scale(1.1); }
                #rani-send svg { width: 20px; height: 20px; fill: white; }
                @media (max-width: 480px) { #rani-chat-popup { width: calc(100vw - 20px); height: calc(100vh - 100px); bottom: 80px; } }
            `;
        },

        createUI: function() {
            var btn = document.createElement('button');
            btn.id = 'rani-widget-btn';
            btn.title = 'Chat dengan RANI';
            btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
            
            var popup = document.createElement('div');
            popup.id = 'rani-chat-popup';
            popup.innerHTML = 
                '<div id="rani-header">' +
                    '<div id="rani-avatar"></div>' +
                    '<div id="rani-info"><h3>RANI</h3></div>' +
                    '<button id="rani-close">✕</button>' +
                '</div>' +
                '<div id="rani-messages"><div class="rani-message rani"><div class="message-bubble">Halo! Saya RANI, Asisten Layanan Informasi Pengadilan Agama Medan. Senang kali awak bisa bantu Kakak/Abang hari ini. Ada yang mau ditanyakan soal syarat atau mau curhat soal rumah tangga? RANI siap dengerin ya! 😊</div></div></div>' +
                '<div id="rani-input-area">' +
                    '<input type="text" id="rani-input" placeholder="Ketik pesan..." autocomplete="off">' +
                    '<button id="rani-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
                '</div>';
            
            document.body.appendChild(btn);
            document.body.appendChild(popup);
        },

        bindEvents: function() {
            var self = this;
            
            document.getElementById('rani-widget-btn').addEventListener('click', function() {
                document.getElementById('rani-chat-popup').classList.toggle('active');
            });
            
            document.getElementById('rani-close').addEventListener('click', function() {
                document.getElementById('rani-chat-popup').classList.remove('active');
            });
            
            document.getElementById('rani-send').addEventListener('click', function() {
                self.sendMessage();
            });
            
            document.getElementById('rani-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') self.sendMessage();
            });
        },

        addMessage: function(text, type) {
            var messages = document.getElementById('rani-messages');
            var div = document.createElement('div');
            div.className = 'rani-message ' + type;
            
            var content = '';
            if (type === 'rani' && window.marked) {
                content = marked.parse(text);
            } else {
                content = this.escapeHtml(text);
            }

            div.innerHTML = '<div class="message-bubble">' + content + '</div>';
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        },

        showTyping: function() {
            var messages = document.getElementById('rani-messages');
            var div = document.createElement('div');
            div.id = 'rani-typing';
            div.className = 'rani-message rani';
            div.innerHTML = '<div class="rani-typing"><span></span><span></span><span></span></div>';
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        },

        hideTyping: function() {
            var typing = document.getElementById('rani-typing');
            if (typing) typing.remove();
        },

        escapeHtml: function(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        sendMessage: function() {
            var self = this;
            var input = document.getElementById('rani-input');
            var text = input.value.trim();
            
            if (!text) return;
            
            this.addMessage(text, 'user');
            input.value = '';
            this.showTyping();
            
            fetch(this.config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pertanyaan: text,
                    session_id: this.sessionId
                })
            })
            .then(function(response) {
                self.hideTyping();
                if (!response.ok) throw new Error('API request failed');
                return response.json();
            })
            .then(function(data) {
                self.addMessage(data.jawaban || 'Maaf, saya tidak bisa menjawab saat ini.', 'rani');
            })
            .catch(function(error) {
                self.hideTyping();
                self.addMessage('Ups! Koneksi gagal. Pastikan RANI API berjalan di server. 😅', 'rani');
            });
        }
    };

    window.RaniWidget = RaniWidget;
})();