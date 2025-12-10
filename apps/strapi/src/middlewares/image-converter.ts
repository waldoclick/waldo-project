export default () => {
  return async (ctx, next) => {
    const originalUrl = ctx.url;

    if (originalUrl.match(/\.(jpg|jpeg|png)$/i)) {
      console.log("Image detected:", {
        type: originalUrl.split(".").pop()?.toLowerCase(),
        path: originalUrl,
      });
    }

    await next();
  };
};
