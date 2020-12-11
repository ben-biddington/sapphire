import { google }       from 'googleapis';
import * as fs          from 'fs'
import * as readline    from 'readline'

export async function authorize(credentials: any, opts: any = {}) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    let token;

    if (fs.existsSync(opts.tokenPath)) {
        token = JSON.parse(fs.readFileSync(opts.tokenPath).toString());
    } else {
        token = await getAccessToken(oAuth2Client, opts);

        fs.writeFileSync(opts.tokenPath, JSON.stringify(token));
    }

    oAuth2Client.setCredentials(token);
    
    return oAuth2Client;
}

function getAccessToken(oAuth2Client:any, opts: any) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type : 'offline',
        scope       : opts.scopes,
    });

    console.log('Authorize this app by visiting this url:\n\n', authUrl, '\n\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((accept, reject) => {
        rl.question('Enter the code from that page here: ', (code: string) => {
            rl.close();
            
            oAuth2Client.getToken(code, (err:any, token:any) => {
                if (err) {
                    reject(err);
                } else {
                    accept(token);
                }
            });
        });
    });
  }
  