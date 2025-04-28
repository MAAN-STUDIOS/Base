"use strict";
import { GameObject } from "./gameobject";

class ObjectItem extends GameObject{
    constructor(options = {}){
        super(options);
        this.type = options.type || "default"
    }

    use(player){
        if(this.type === "arma"){

        }else if(this.type === "herramienta"){

        }else if(this.type === "consumible"){

        }else if(this.type === "modulo"){

        }else if(this.type === "registro"){

        }else if(this.type === "comida"){

        }else if(this.type === "bateria"){

        }
        return undefined;
    }
}