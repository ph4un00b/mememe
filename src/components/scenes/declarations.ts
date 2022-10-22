import * as T from "three";
import * as F from "@react-three/fiber";
import { AguaMat } from "./Home/Fondo";

export type ShaderProps = T.ShaderMaterial & {
    [key: string]: any;
};

declare module "@react-three/fiber" {
    interface ThreeElements {
        aguaMat: F.Object3DNode<ShaderProps, typeof AguaMat>;
    }
}
