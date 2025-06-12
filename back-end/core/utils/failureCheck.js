function atObjectNullSafe(config, errMsg, logger) {
    logger.debug(`Checking env variables: ${JSON.stringify(config)}`);
    for (const [key, value] of Object.entries(config)) {
        if (!value) {
            throw new Error(`${errMsg}: ${key}`);
        }
    }
}

async function atDBConnection(pool, query, initializer, logger) {
    try {
        if (!pool) {
            await initializer();
        }

        const result = (await query("SELECT 1 + 1 AS solution"))[0].solution;

        if (result !== 2) {
            logger.error(`Database tests failed, result: ${result}`);
            return false;
        }

        logger.debug(`Database test query successful (1 + 1): ${result}`);
        logger.info("Database connection verified and ready");
        return true;
    } catch (err) {
        logger.error("Database connection test failed:\n", err);
        return false;
    }
}

function atNoRespondSendGuard(res, logger) {
    if (res.headersSent) return;

    logger?.error("Mo respond sent")
    res.status(500).send({ error: 'Internal server error (No respond sent)' });
}

export default {
    atObjectNullSafe,
    atDBConnection,
    atNoRespondSendGuard,
};