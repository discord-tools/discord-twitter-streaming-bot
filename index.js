// Written by Eric Crosson
// 2017-11-13
//
// Create twitter streams from twitter users to discord channels.

'use strict;'

const _ = require('lodash')
const config = require('./config.json')

////
// Logging configuration
const winston = require('winston')
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
})
////

////
// Discord configuration
const discord = new (require('discord.js')).Client()

discord.on('ready', () => {
    logger.info('Listener ready: discord')
})
////

////
// Twitter configuration
const Twit = require('twit')
const twitter = new Twit({
  consumer_key: config.twitter['consumer_key'],
  consumer_secret: config.twitter['consumer_secret'],
  access_token: config.twitter['token_key'],
  access_token_secret: config.twitter['token_secret']
})
////

////
// Data manipulation
var streams = {}
var streamNames = {}

_.each(config.streams, (stream, streamName) => {
    streams[stream['twitter_id']] = stream['discord_channel_id']
    streamNames[stream['twitter_id']] = streamName
})

const twitterIds = _.keys(streams)
////

let stream = twitter.stream('statuses/filter', {follow: twitterIds})
stream.on('tweet', (tweet) => {
    logger.info(`Event on stream ${streamNames[tweet.user['id']]}`)
    logger.debug(`Received tweet: ${tweet.text}`)
    discord
        .channels
        .find('id', streams[tweet.user['id']])
        .send(tweet.text)
})

stream.on('connected', (response) => {
    logger.info('Listener ready: twitter')
})
stream.on('error', (error) => { throw error })
stream.on('disconnect', (disconnectMessage) => {
    logger.warn('Received a disconnect message from twitter:')
    logger.warn(disconenctMessage)
})

discord.login(config.discord_token)
