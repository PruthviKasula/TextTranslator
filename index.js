const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios").default;
const { v4: uuidv4, stringify } = require("uuid");
const bodyParser = require("body-parser");
const config = require("./config/default.json");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const jsonParser = bodyParser.json();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

const options = {
    swaggerDefinition: {
        info: {
            title: "Text Translator API",
            version: "1.0.0",
            description: "Text Translator API documentation autogenerated by Swagger",
        },
        host: "localhost:3000",
        basePath: "/",
    },
    apis: ["./index.js"],
};

const specs = swaggerJsdoc(options);
app.use("/swaggerFinalProjDoc", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());
const { check, validationResult, body } = require("express-validator");

app.get("/", (req, res) => {
    res.send('Welcome! Please find API documentation- http://137.184.210.75:3000/swaggerFinalProjDoc');
});

/**
 * @swagger
 * /api.v1.TextTranslator.com/AllLanguages/{scope}:
 *    get:
 *      tags:
 *          - "TranslatorAPI"
 *      description: Gets the set of languages currently supported
 *      parameters:
 *          - in: path
 *            name: scope
 *            schema:
 *              type: string
 *              example : translation
 *            required: true
 *            description: translation or transliteration or dictionary
 *      produces: 
 *          - application/json
 *      responses:
 *          200:
 *              description: Success operation!
 *          400: 
 *              description: Error!
 */
app.get("/api.v1.TextTranslator.com/AllLanguages/:scope", async (req, res) => {
    axios({
        baseURL: config.translator.endpoint,
        url: "/languages",
        method: "get",
        headers: {
            "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
            "Ocp-Apim-Subscription-Region": config.translator.location,
            "Content-type": "application/json",
            "X-ClientTraceId": uuidv4().toString(),
        },
        params: {
            "api-version": "3.0",
            "scope": req.params.scope
        },
        responseType: "json",
    }).then(function (response) {
        res.status(200).json(response.data, null, 4);
    }).catch((ex) => {
        if (!req.params.scope)
            res.status(400).json(ex.message + ": Missing request parameter 'scope'")
        res.status(400).json(ex.message);
    });
});

/**
 * @swagger
 * /api.v1.TextTranslator.com/Translate:
 *        post:
 *          tags:
 *            - "TranslatorAPI"
 *          description: Translate and Detect input text       
 *          produces:
 *            - application/json
 *          parameters:
 *            - name: Translate
 *              description: text translation
 *              in: body
 *              required: true
 *              schema: 
 *                $ref: '#/definitions/Translate'
 *          responses:
 *            200:
 *              description: Success operation!
 *            400:
 *              description: Error!
 */
/**
 * @swagger
 * definitions:
 *   Translate:
 *     properties:
 *       text:
 *         type: string
 *         example: "Flower"
 *         description: text to be translated
 *       to:
 *         type: string
 *         example: "te"
 *         description: Language to which the text is to be translated.
 */
app.post(
    "/api.v1.TextTranslator.com/Translate",
    jsonParser,
    [
        check("text")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid text"),
        check("to")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid 'to'"),
    ],
    async (req, res) => {
        axios({
            baseURL: config.translator.endpoint,
            url: "/translate?profanityAction=Marked",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
                "Ocp-Apim-Subscription-Region": config.translator.location,
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
                to: req.body.to,
                profanityAction: 'Marked',                
            },
            data: [
                {
                    text: req.body.text,
                },
            ],
            
            responseType: "json",
        }).then(function (response) {
            res.status(200).json(response.data, null, 4);
        }).catch((ex) => {
            if (!req.body.text)
                res.status(400).json(ex.message + " Missing parameter 'text'");
            if (!req.body.to)
                res.status(400).json(ex.message + ": Missing parameter 'to'");
            res.status(400).json(ex.message);
        });
    }
);


/**
 * @swagger
 * /api.v1.TextTranslator.com/Detect:
 *        post:
 *          tags:
 *            - "TranslatorAPI"
 *          description: Detects language of the text       
 *          produces:
 *            - application/json
 *          responses:
 *            200:
 *              description: Success operation!
 *            400:
 *              description: Error!
 *          parameters:
 *            - name: Detect
 *              description: Detection text
 *              in: body
 *              required: true
 *              schema: 
 *                $ref: '#/definitions/Detect'
 */
/**
 * @swagger
 * definitions:
 *   Detect:
 *     properties:
 *       text:
 *         type: string
 *         example: "?????? Good to see you"
 *         description: Detects the language of the text
 */

app.post(
    "/api.v1.TextTranslator.com/Detect",
    jsonParser,
    [
        check("text")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid text"),
    ],
    async (req, res) => {
        var detect = [
            {
                PrimaryLanguage: "",
                score: "",
                SecondaryLanguage: [
                    {
                        language: "",
                        score: "",
                    },
                ],
            },
        ];
        axios({
            baseURL: config.translator.endpoint,
            url: "/detect",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
                "Ocp-Apim-Subscription-Region": config.translator.location,
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
            },
            data: [
                {
                    text: req.body.text,
                },
            ],
            responseType: "json",
        })
            .then(function (response) {
                for (var i = 0; i < response.data.length; i++) {
                    detect[i].PrimaryLanguage = response.data[i].language;
                    detect[i].score = response.data[i].score;
                    if (response.data[i].alternatives) {
                        detect[i].SecondaryLanguage[i].language =
                            response.data[i].alternatives[i].language;
                        detect[i].SecondaryLanguage[i].score =
                            response.data[i].alternatives[i].score;
                    }
                }
                res.status(200).json(detect, null, 4);
            })
            .catch((ex) => {
                if (!req.body.text)
                    res.status(400).json(ex.message + ": Missing parameter detect");
                res.status(400).json(ex.message);
            });
    }
);

/**
 * @swagger
 * /api.v1.TextTranslator.com/Transliterate:
 *        post:
 *          tags:
 *            - "TranslatorAPI"
 *          description: Text conversion of one language to another based on phonetic similarity       
 *          produces:
 *            - application/json
 *          responses:
 *            200:
 *              description: Success Operation!
 *            400:
 *              description: Error!
 *          parameters:
 *            - name: Transliterate
 *              description: Transliterate text
 *              in: body
 *              required: true
 *              schema: 
 *                $ref: '#/definitions/Transliterate'
 */
/**
 * @swagger
 * definitions:
 *   Transliterate:
 *     properties:
 *       text:
 *         type: string
 *         example: "??????????????????"
 *         description: text to be transliterated
 *       language:
 *         type: string
 *         example: "th"
 *         description: Language of the text
 *       fromScript:
 *         type: string
 *         example: "Thai"
 *         description: Name of the script of the text.
 *       toScript:
 *          type: string
 *          example: "Latn"
 *          description: Name of the script to be transliterated
 */

app.post(
    "/api.v1.TextTranslator.com/Transliterate",
    jsonParser,
    [
        check("text")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid text"),
        check("language")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid language code"),
        check("fromScript")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid language script"),
        check("toScript")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid language script"),
    ],
    async (req, res) => {
        axios({
            baseURL: config.translator.endpoint,
            url: "/transliterate",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
                "Ocp-Apim-Subscription-Region": config.translator.location,
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
                language: req.body.language,
                fromScript: req.body.fromScript,
                toScript: req.body.toScript,
            },
            data: [
                {
                    text: req.body.text,
                },
            ],
            responseType: "json",
        })
            .then(function (response) {
                res.status(200).json(response.data, null, 4);
            })
            .catch((ex) => {
                if (!req.body.text)
                    res.status(400).json(ex.message + ": Missing parameter 'text'");
                if (!req.body.language)
                    res.status(400).json(ex.message + ": Missing parameter 'language'");
                if (!req.body.fromScript)
                    res.status(400).json(ex.message + ": Missing parameter 'fromScript'");
                if (!req.body.toScript)
                    res.status(400).json(ex.message + " Missing parameter 'toScript'");
                res.status(400).json(ex.message);
            });
    }
);

/**
 * @swagger
 * /api.v1.TextTranslator.com/BreakSentence:
 *        post:
 *          tags:
 *            - "TranslatorAPI"
 *          description: Get sentence length during translation       
 *          produces:
 *            - application/json
 *          responses:
 *            200:
 *              description: Success Operation!
 *            400:
 *              description: Error!
 *          parameters:
 *            - name: Sentence
 *              description: Sentence
 *              in: body
 *              required: true
 *              schema: 
 *                $ref: '#/definitions/Sentence'
 */
/**
 * @swagger
 * definitions:
 *   Sentence:
 *     properties:
 *       text:
 *         type: string
 *         example: "Hello, how are you? Hope you are doing great! Have a good time"
 *         description: sentence
 */
app.post(
    "/api.v1.TextTranslator.com/BreakSentence",
    jsonParser,
    [
        check("text")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid text"),
    ],
    async (req, res) => {
        var sentenceLength = [
            {
                sent: "",
            },
        ];
        var breakSentence = [
            {
                SentenceLength: [],
                PrimaryLanguageDetected: {},
            },
        ];
        axios({
            baseURL: config.translator.endpoint,
            url: "/breaksentence",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
                "Ocp-Apim-Subscription-Region": config.translator.location,
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
            },
            data: [
                {
                    text: req.body.text,
                },
            ],
            responseType: "json",
        })
            .then(function (response) {
                for (var i = 0; i < response.data[0].sentLen.length; i++) {
                    sentenceLength[i] =
                        "Sentence " + [i + 1] + " : " + response.data[0].sentLen[i];
                }
                for (var i = 0; i < response.data.length; i++) {
                    breakSentence[i].PrimaryLanguageDetected = response.data[0].detectedLanguage;
                    breakSentence[i].SentenceLength = sentenceLength;
                }
                res.status(200).json(breakSentence, null, 4);
            })
            .catch((ex) => {
                if (!req.body.text)
                    res.status(400).json(ex.message + ": Missing parameter senetence");
                res.status(400).json(ex.message);
            });
    }
);

/**
 * @swagger
 * /api.v1.TextTranslator.com/AlternateTranslations:
 *        post:
 *          tags:
 *            - "TranslatorAPI"
 *          description: Gives alternate translations of the input       
 *          produces:
 *            - application/json
 *          responses:
 *            200:
 *              description: Sucess Operation!
 *            400:
 *              description: Error!
 *          parameters:
 *            - name: Alternate_Translation
 *              description: Alternate_Translation Object
 *              in: body
 *              required: true
 *              schema: 
 *                $ref: '#/definitions/Alternate_Translation'
 */
/**
 * @swagger
 * definitions:
 *   Alternate_Translation:
 *     properties:
 *       text:
 *         type: string
 *         example: "shark"
 *         description: Input text
 *       from:
 *         type: string
 *         example: "en"
 *         description: Language code of the input text
 *       to:
 *         type: string
 *         example: "es"
 *         description: Language to which the input text is to translated
 */

app.post("/api.v1.TextTranslator.com/AlternateTranslations", jsonParser,
    [
        check("text")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid word/phrase"),
        check("from")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid language"),
        check("to")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .isString()
            .withMessage("Please enter valid language")
    ], async (req, res) => {
        axios({
            baseURL: config.translator.endpoint,
            url: "/dictionary/lookup",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": config.translator.subscriptionKey,
                "Ocp-Apim-Subscription-Region": config.translator.location,
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
                from: req.body.from,
                to: req.body.to,
            },
            data: [
                {
                    text: req.body.text,
                },
            ],
            responseType: "json",
        })
            .then(function (response) {
                res.status(200).json(response.data[0].translations, null, 4);
            })
            .catch((ex) => {
                if (!req.body.text)
                    res.status(400).json(ex.message + ": Missing parameter 'text'");
                if (!req.body.from)
                    res.status(400).json(ex.message + ": Missing parameter 'from'");
                if (!req.body.to)
                    res.status(400).json(ex.message + ": Missing parameter 'to'");
                res.status(400).json(ex.message);
            });
    });

app.listen(port, () => {
    console.log(`Server is running and listening at http://localhost:${port}`);
});