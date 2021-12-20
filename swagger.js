// Dica. Utilize o editor disponível em: https://editor.swagger.io/
import swaggerAutogen from 'swagger-autogen'

const doc = {
    swagger: "2.0",
    info: {
        version: "1.0.0",
        title: "🐕API DogWalker",
        description: "Documentação gerada automaticamente pelo módulo <strong>swagger-autogen</strong>."
    },
    host: "http://localhost:4000",
    basePath: "/",
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        apiKeyAuth:{
            type: "apiKey",
            in: "header",       // can be "header", "query" or "cookie"
            name: "X-API-KEY",  // name of the header, query parameter or cookie
            description: "any description..."
        }
    },
    definitions: {
        Erro: {
            value: "Erro gerado pela aplicação",
            msg: "Mensagem detalhando o erro",
            param: "URL que gerou o erro"
        },
        Usuário: {
            nome: "Josefina Gusmão",
            email: "josefina@uol.com.br",
            ativo: true,
            tipo: "Cliente",
            avatar: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Josefina+Gusmão"
        },
        DadosUsuário: {
            $nome: "Josefina Gusmão",
            $email: "josefina@uol.com.br",
            $senha: "SenhaSecreta",
            tipo: "Cliente",
            ativo: true,
            avatar: "https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=Dog+Walker"
        }
    }
}

const outputFile = './src/swagger/swagger_output.json'
const endpointsFiles = ['./src/server.js']
const options = {
    swagger: '2.0',          // By default is null
    language: 'pt-BR',         // By default is 'en-US'
    disableLogs: false,     // By default is false
    disableWarnings: false  // By default is false
}

swaggerAutogen(options)(outputFile, endpointsFiles, doc).then(async () => {
    await import('./src/server.js'); // Your project's root file
  });