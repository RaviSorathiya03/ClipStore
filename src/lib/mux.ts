import Mux from "@mux/mux-node";
const client = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});
      

export { client };