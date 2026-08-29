<script>
  import Key from './Key.svelte';
  export let layout;
  export let designview = false;

  $: rows = layout.displayKeys || layout.keys;

  function valueFor(key, mode) {
    if (mode === 'target') return key.target_value || 0;
    if (mode === 'shift') return key.shift_role_value || 0;
    return key.value || 0;
  }

  function countFor(key, mode) {
    if (mode === 'target') return key.target_count || 0;
    if (mode === 'shift') return key.shift_role_count || 0;
    return key.count || 0;
  }
</script>

<style>
  .keyboard {
    margin: auto;
    text-align: center;
  }

  .heatmap-block {
    margin: 4px 0 10px 0;
  }

  .heatmap-label {
    margin-bottom: 2px;
    font-size: 11px;
    text-align: left;
  }

  .row {
    display: flex;
  }
</style>

{#if designview}
  <div class="keyboard">
    {#each rows as row}
      <div class="row">
        {#each row as key}
          <Key legend={key.legend} size={key.size} value={key.legend.length == 0 ? -1 : (key.finger + 1) / 10} color="random" home={key.home} />
        {/each}
      </div>
    {/each}
  </div>
{:else}
  <div class="keyboard">
    {#each [['total', '総打鍵'], ['target', '文字ターゲット（シフト役を除く）'], ['shift', 'シフト役のみ']] as heatmap}
      <div class="heatmap-block">
        <div class="heatmap-label">{heatmap[1]}</div>
        {#each rows as row}
          <div class="row">
            {#each row as key}
              <Key legend={key.legend} size={key.size} value={valueFor(key, heatmap[0])} count={countFor(key, heatmap[0])} home={key.home} />
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}
