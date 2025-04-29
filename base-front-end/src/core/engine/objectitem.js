"use strict";
import { GameObject } from "./gameobject";
import { hitbox } from "../utils/hitbox.js";

class ObjectItem extends GameObject{
    constructor(options = {}){
        super(options);
        this.type = options.type || "default"
        this.hitbox = hitbox(this.position, this.width, this.height, { isLogical: true, isPhysical: false });
    }

    use(player){
        return undefined;
    }
}