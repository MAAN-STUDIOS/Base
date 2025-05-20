/* Clase para representar fragmentos de conocimiento o información que los jugadores pueden recolectar. 
Para humanos revelan la historia y componentes de la cura; 
para Flood revelan información sobre la ubicación de la cura.
*/

import { GameObject } from "./gameobject.js";

// Objectos para los tipos de fragmentos 
const KnowledgeType = {
  HISTORY: "history",
  CURE_COMPONENT: "cure",
  LOCATION: "location",
  CHARACTER: "character",
};

const GameMode = {
    HUMAN: "human",
    FLOOD: "flood"
};

export class KnowledgeFragment extends GameObject {
    constructor(content, importance, type, gameMode = GameMode.HUMAN) {
        super(); 
        this.content = content;
        this.importance = importance;
        this.type = type;
        this.gameMode = gameMod;
        this.isRevealed = false;
        
        // Validar la importancia
        if (importance < 1 || importance > 3) {
            throw new Error("Importance must be between 1 and 3");
        }
    }

    reveal() {      //Muestra el contenido al jugador 
        this.isRevealed = true;
        // Guardamos este fragmento en la colección
        KnowledgeFragment.collectedFragments.set(this.id, this);
        //Efectos de progresión para keyfragments 
        if (this.isKeyFragment()) {
            this.applyProgressionEffects();
        }

        //Diferentes efectos seguú quién lo juegue
        if (this.gameMode == GameMode.HUMAN) {
            //Para humanos: 
            console.log(`Human found knowlegde: ${this.content}`);
            return this.content;
        }
        else {
            //Para flood:
            if (this.type == KnowledgeType.LOCATION) {
                console.log(`Flood found crucial information: ${this.content}`);
                return this.content;
                }
                else {
                    console.log("Flood found knowlegde of limited use");
                    return "This knowledge is of limited use to the Flood...";
                }
            }
        }
    
    //Método para determinar si es más o menos valioso
    isKeyFragment(){
        return this.importance == 3 ||
                (this.gameMode == GameMode.HUMAN && this.type == KnowledgeType.CURE_COMPONENT) ||
                (THIS.gameMode == GameMode.FLOOD && this.type == KnowledgeType.LOCATION); 
    }

    applyProgressionEffects(){
        if (this.gameMode == GameMode.HUMAN) {
            if (this.type == KnowledgeType.CURE_COMPONENT) {
                console.log("Progressions Effect: Unlocked new cure cure components!");
            }
            else if (this.type == KnowledgeType.HISTORY) {
                console.log("Progressions Effect: Revealed new story elements!"); 
            }
        } else { 
            if (this.type == KnowledgeType.LOCATION) {
                console.log("Progression Effect: Revealed new coordinates for the flood!")
            }
        }
    }
}

//Inicializa la colleción estática para rastrear fragmentos 
KnowledgeFragment.collectedFragments = new Map();

export { KnowledgeType, GameMode };


