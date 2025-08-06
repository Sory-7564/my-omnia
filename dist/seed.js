"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var faker_1 = require("@faker-js/faker");
var supabaseClient_1 = require("@/lib/supabaseClient");
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var userId_1, categories_1, produits, _a, insertedProduits, produitsError, _loop_1, _i, insertedProduits_1, produit, err_1, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    userId_1 = '00000000-0000-0000-0000-000000000000' // Remplace par un vrai user
                    ;
                    categories_1 = [
                        'Électronique', 'Vêtements', 'Maison', 'Auto', 'Gaming', 'Sport',
                        'Cuisine', 'Livres', 'Outils', 'Nourriture', 'Bijoux', 'Bricolage',
                        'Animaux', 'Voitures', 'Autres'
                    ];
                    produits = Array.from({ length: 10 }, function () { return ({
                        nom: faker_1.faker.commerce.productName(),
                        description: faker_1.faker.commerce.productDescription(),
                        prix: faker_1.faker.commerce.price({ min: 5, max: 1500, dec: 0 }),
                        categorie: faker_1.faker.helpers.arrayElement(categories_1),
                        user_id: userId_1,
                        created_at: new Date().toISOString()
                    }); });
                    return [4 /*yield*/, supabaseClient_1.supabase
                            .from('produits')
                            .insert(produits)
                            .select()];
                case 1:
                    _a = _b.sent(), insertedProduits = _a.data, produitsError = _a.error;
                    if (produitsError)
                        throw produitsError;
                    console.log("\u2705 ".concat(insertedProduits.length, " produits ins\u00E9r\u00E9s"));
                    _loop_1 = function (produit) {
                        var nbImages, images, imagesError;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    nbImages = faker_1.faker.number.int({ min: 1, max: 3 });
                                    images = Array.from({ length: nbImages }, function () { return ({
                                        produit_id: produit.id,
                                        url: "https://placehold.co/600x400?text=".concat(encodeURIComponent(produit.nom)),
                                        type: 'image'
                                    }); });
                                    return [4 /*yield*/, supabaseClient_1.supabase
                                            .from('images_produits')
                                            .insert(images)];
                                case 1:
                                    imagesError = (_c.sent()).error;
                                    if (imagesError)
                                        throw imagesError;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, insertedProduits_1 = insertedProduits;
                    _b.label = 2;
                case 2:
                    if (!(_i < insertedProduits_1.length)) return [3 /*break*/, 5];
                    produit = insertedProduits_1[_i];
                    return [5 /*yield**/, _loop_1(produit)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('✅ Images associées ajoutées');
                    console.log('🎉 Seeding terminé');
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    error = err_1;
                    console.error('❌ Erreur lors du seeding:', error.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
seed();
