"use strict";
import { GameObject } from "./gameobject";
import { Hitbox } from "@utils/hitbox.js";

class ObjectItem extends GameObject{
    constructor(options = {}){
        super(options);
        this.type = options.type || "default"
        this.hitbox = new Hitbox(this.position, this.width, this.height, { isLogical: true, isPhysical: false });
    }

    use(player){
        return undefined;
    }
}