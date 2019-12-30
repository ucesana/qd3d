import {Vec2} from "../mathematics/vec2";
import {Vec3} from "../mathematics/vec3";
import {Mesh} from "./mesh";

export const MeshLoader = function () {
    this.parse = function (data) {
        this.vertices = [];
        this.textureVertices = [];
        this.vertexNormals = [];
        this.faces = [];
        this.textures = [];
        this.normals = [];

        const lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
            this.parseLine(lines[i]);
        }
    };

    this.parseLine = function (line) {
        const sanitisedLine = this.sanitiseLine(line);

        if (sanitisedLine && sanitisedLine.length > 0) {
            const tokens = sanitisedLine.split(" ");
            if (tokens != null && tokens.length > 0) {
                const command = tokens[0].toLowerCase();
                const restTokens = tokens.slice(1);
                switch (command) {
                    case 'v':
                        this.parseVec3(restTokens, this.vertices);
                        break;
                    case 'vt':
                        this.parseVec2(restTokens, this.textureVertices);
                        break;
                    case 'vn':
                        this.parseVec3(restTokens, this.vertexNormals);
                        break;
                    case 'f':
                        this.parseFace(restTokens);
                        break;
                }
            }
        }
    };

    this.sanitiseLine = function (line) {
        let sanitisedLine = line.trim();
        sanitisedLine = sanitisedLine.replace(/\s+/g, " ");
        return sanitisedLine;
    };

    this.parseVec2 = function (tokens, array) {
        let v = Vec2.create(
            parseFloat(tokens[0]),
            parseFloat(tokens[1]));
        array.push(v);
    };

    this.parseVec3 = function (tokens, array) {
        let v = Vec3.create(
            parseFloat(tokens[0]),
            parseFloat(tokens[1]),
            parseFloat(tokens[2]));
        array.push(v);
    };

    this.parseFace = function (tokens) {
        const vGroup1 = this.parseVertexGroup(tokens[0]);
        const v1Indx = vGroup1.geometricVertex;
        const vt1Indx = vGroup1.textureVertex;
        const vn1Indx = vGroup1.vertexNormal;

        for (let i = 0; i < tokens.length - 2; i++) {
            const vGroup2 = this.parseVertexGroup(tokens[i + 1]);
            const vGroup3 = this.parseVertexGroup(tokens[i + 2]);
            const v2Indx = vGroup2.geometricVertex;
            const vt2Indx = vGroup2.textureVertex;
            const vn2Indx = vGroup2.vertexNormal;
            const v3Indx = vGroup3.geometricVertex;
            const vt3Indx = vGroup3.textureVertex;
            const vn3Indx = vGroup3.vertexNormal;

            this.faces.push(v1Indx);
            this.faces.push(v2Indx);
            this.faces.push(v3Indx);

            this.textures.push(vt1Indx);
            this.textures.push(vt2Indx);
            this.textures.push(vt3Indx);

            this.normals.push(vn1Indx);
            this.normals.push(vn2Indx);
            this.normals.push(vn3Indx);
        }
    };

    this.parseVertexGroup = function (vertexGroup) {
        if (vertexGroup.indexOf("/") > -1) {
            const tokens = vertexGroup.split("/");
            return {
                geometricVertex: parseInt(tokens[0]) - 1,
                textureVertex: parseInt(tokens[1]) - 1,
                vertexNormal: parseInt(tokens[2]) - 1
            }
        } else {
            return {
                geometricVertex: parseInt(vertexGroup) - 1
            }
        }
    };
};

MeshLoader.prototype.load = function (data) {
    this.parse(data);
    const mesh = new Mesh();
    mesh.vertices = this.vertices;
    mesh.vertexCount = this.vertices.length;
    mesh.faces = this.faces;
    mesh.faceCount = Math.ceil(mesh.faces.length / 3);
    mesh.textureVertices = this.textureVertices;
    mesh.textureVertexCount = this.textureVertices.length;
    mesh.textures = this.textures;
    mesh.vertexNormals = this.vertexNormals;
    mesh.vertexNormalCount = this.vertexNormals.length;
    mesh.normals = this.normals;
    return mesh;
};
