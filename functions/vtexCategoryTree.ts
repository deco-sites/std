import { LiveState, LoaderFunction } from "$live/types.ts";
import { CategoryTree } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
    /**
     * @description number of categories levels to be returned
     * @default 2
        */
    levels: number;
}

const categoryTree: LoaderFunction<Props, CategoryTree | null, LiveState<{ configVTEX: ConfigVTEX }>> = withISFallback(async (_, ctx, { levels }) => {
    const vtex = createClient(ctx.state.global.configVTEX);
    const categoryTree = await vtex.catalog_system.categoryTree({categoryLevels: levels});

    return {
        data: categoryTree,
    };
});

export default categoryTree;

