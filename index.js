const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs-extra');

// Criar nova instância
const AutoZapp = new Client({
    authStrategy: new LocalAuth({
        dataPath: "SessionAutoZapp"
    })
});


// Caminho do arquivo que você deseja verificar
const filePath = path.join(__dirname, 'database/db.json');




// Verifica se o arquivo existe
if (!fs.existsSync(filePath)) {
    let data = {
        usuarios: {},
        grupos: {},
        infobot: {
            nomeBot: 'AutoZapp Inc.',
            prefix: '/',
            numeroBot: null
        }
    };
    
    // Se não existir, cria um novo arquivo
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8'); // Converte o objeto em JSON
    console.log('Arquivo criado:', filePath);
} else {
    console.log('O arquivo já existe:', filePath);
}







// Exibe o QR code
AutoZapp.on('qr', (qr) => {
    console.log("\n\n Leia o código QRCode, com seu celular abrindo o WhatsApp:\n ");
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
AutoZapp.on('ready', () => {
    console.log("Cliente logado.");
});

// Função para carregar plugins
const loadPlugins = () => {
    const pluginsDir = path.join(__dirname, 'plugins');
    const plugins = {};

    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            const plugin = require(path.join(pluginsDir, file)); // Carrega o plugin
            plugins[file] = plugin; // Armazena o plugin
        }
    });

    return plugins; // Retorna todos os plugins carregados
};

// Carregar plugins iniciais
let plugins = loadPlugins();

// Escuta mensagens e passa a mensagem para os plugins
AutoZapp.on('message', async (msg) => {
    
    

    for (const pluginName in plugins) {
        plugins[pluginName](AutoZapp, msg); // Passa o cliente e a mensagem para cada plugin

        
    }

    if(!global.db.usuarios[msg.from]) {
        global.db.usuarios[msg.from] = {
                id: msg.from
        }

    }
    fs.writeFileSync(filePath, JSON.stringify(global.db, null, 2), 'utf8');
});

// Monitorar mudanças na pasta de plugins
fs.watch('./plugins', (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`Arquivo ${filename} alterado. Recarregando plugin...`);
        delete require.cache[require.resolve(`./plugins/${filename}`)]; // Limpa o cache do plugin
        const plugin = require(`./plugins/${filename}`);
        plugins[filename] = plugin; // Recarrega o plugin
    }
});

let database = JSON.parse(fs.readFileSync('./database/db.json'))
global.db  = database

console.log(global.db)
// Inicializa o cliente
AutoZapp.initialize();