import './style.css';
import { registerScreen, navigate } from '@utils/router.js';
import screenMenu from '@/screens/menu.js';
import screenStartGame from '@/screens/startgame.js';
import screenGame from "@screens/game.js";
import screenFloodTest from "@/screens/floodtest.js";
import screenPageNotFound from "@screens/404.js";
import screenCredits from "@screens/credits.js";


registerScreen('menu', screenMenu);
registerScreen('play', screenStartGame);
registerScreen('game', screenGame);
registerScreen('flood', screenFloodTest);
registerScreen(404, screenPageNotFound);
registerScreen('credits', screenCredits);


navigate(location.pathname.slice(1) || 'menu');
