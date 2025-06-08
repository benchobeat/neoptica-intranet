import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import prisma from '@/utils/prisma';

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.usuario.findUnique({ where: { proveedor_oauth_oauth_id: { proveedor_oauth: 'google', oauth_id: profile.id } } });
    if (!user) {
      user = await prisma.usuario.create({
        data: {
          nombre_completo: profile.displayName,
          email: profile.emails?.[0]?.value,
          proveedor_oauth: 'google',
          oauth_id: profile.id,
          activo: true,
          usuario_rol: { create: { rol: { connect: { nombre: 'cliente' } } } },
        },
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, undefined);
  }
}));

// Facebook Strategy (estructura base)
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
  profileFields: ['id', 'displayName', 'emails'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.usuario.findUnique({ where: { proveedor_oauth_oauth_id: { proveedor_oauth: 'facebook', oauth_id: profile.id } } });
    if (!user) {
      user = await prisma.usuario.create({
        data: {
          nombre_completo: profile.displayName,
          email: profile.emails?.[0]?.value,
          proveedor_oauth: 'facebook',
          oauth_id: profile.id,
          activo: true,
          usuario_rol: { create: { rol: { connect: { nombre: 'cliente' } } } },
        },
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, undefined);
  }
}));

// Instagram Strategy
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID!,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
  callbackURL: process.env.INSTAGRAM_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.usuario.findUnique({ where: { proveedor_oauth_oauth_id: { proveedor_oauth: 'instagram', oauth_id: profile.id } } });
    if (!user) {
      user = await prisma.usuario.create({
        data: {
          nombre_completo: profile.displayName,
          email: profile.emails?.[0]?.value || null, // Instagram puede no retornar email
          proveedor_oauth: 'instagram',
          oauth_id: profile.id,
          activo: true,
          usuario_rol: { create: { rol: { connect: { nombre: 'cliente' } } } },
        },
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, undefined);
  }
});

export default passport;
