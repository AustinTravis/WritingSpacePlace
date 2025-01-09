import { createClient } from '@/lib/supabase'

export async function generateRandomPrompt() {
    const supabase = createClient()
  
    // Get total count first
    const { count } = await supabase
      .from('prompt_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
  
    if (!count) return null
  
    // Get random offset
    const offset = Math.floor(Math.random() * count)
  
    // Get random template using offset
    const { data: templateData } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true)
      .range(offset, offset)
      .single()
  
    if (!templateData) return null
  
    let finalPrompt = templateData.template
  
    // Get components for each required type
    for (const componentType of templateData.required_components) {
      // Get count for this component type
      const { count: componentCount } = await supabase
        .from('prompt_components')
        .select('*', { count: 'exact', head: true })
        .eq('component_type', componentType)
  
      if (!componentCount) continue
  
      // Get random component using offset
      const randomOffset = Math.floor(Math.random() * componentCount)
      const { data: componentData } = await supabase
        .from('prompt_components')
        .select('content')
        .eq('component_type', componentType)
        .range(randomOffset, randomOffset)
        .single()
  
      if (componentData) {
        finalPrompt = finalPrompt.replace(`{${componentType}}`, componentData.content)
      }
    }
  
    await supabase.from('prompt_generations').insert({
      template_id: templateData.id,
      final_prompt: finalPrompt,
      components_used: templateData.required_components
    })
  
    return finalPrompt
  }