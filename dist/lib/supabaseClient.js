"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// lib/supabaseClient.ts
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = 'https://xxxxxxxx.supabase.co'; // remplace par ton URL
var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI...'; // remplace par ta clé "anon public"
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
