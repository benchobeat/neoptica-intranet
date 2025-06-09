import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as InstagramStrategy } from 'passport-instagram';

import prisma from '../utils/prisma';

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.usuario.findUnique({
          where: { proveedorOauth_oauthId: { proveedorOauth: 'google', oauthId: profile.id } },
        });
        if (!user) {
          user = await prisma.usuario.create({
            data: {
              nombreCompleto: profile.displayName,
              email: profile.emails?.[0]?.value,
              proveedorOauth: 'google',
              oauthId: profile.id,
              activo: true,
              roles: { create: { rol: { connect: { nombre: 'cliente' } }, creadoEn: new Date(), creadoPor: 'system' } },
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// Facebook Strategy (estructura base)
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.usuario.findUnique({
          where: {
            proveedorOauth_oauthId: { proveedorOauth: 'facebook', oauthId: profile.id },
          },
        });
        if (!user) {
          user = await prisma.usuario.create({
            data: {
              nombreCompleto: profile.displayName,
              email: profile.emails?.[0]?.value,
              proveedorOauth: 'facebook',
              oauthId: profile.id,
              activo: true,
              roles: { create: { rol: { connect: { nombre: 'cliente' } }, creadoEn: new Date(), creadoPor: 'system' } },
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// Instagram Strategy
passport.use(
  new InstagramStrategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.usuario.findUnique({
          where: {
            proveedorOauth_oauthId: { proveedorOauth: 'instagram', oauthId: profile.id },
          },
        });
        if (!user) {
          user = await prisma.usuario.create({
            data: {
              nombreCompleto: profile.displayName,
              email: profile.emails?.[0]?.value || null, // Instagram puede no retornar email
              proveedorOauth: 'instagram',
              oauthId: profile.id,
              activo: true,
              roles: { create: { rol: { connect: { nombre: 'cliente' } }, creadoEn: new Date(), creadoPor: 'system' } },
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;
