module.exports = (AutoZapp, msg) => {
    console.log(msg.body); // Aqui você pode ver o conteúdo da mensagem recebida
    

    // Verifica se a mensagem é "oi" e responde
    if (msg.body.toLowerCase() === 'oi') {
        AutoZapp.sendMessage(msg.from, 'Olá! Como posso ajudar? Sou ' + global.db.nome);
       
        

    }
};