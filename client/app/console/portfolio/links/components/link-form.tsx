"use client";

import { LinkFormValues, LinkFormSchema } from "@/validation-schemas/portfolio";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { PortfolioSkill } from "interfaces/portfolio";
import { PortfolioSkillsTypes } from "@/constants/supabase";
import { upsertSkill } from "services/skills";
import { SocialMediaOptions } from "@/constants/dropdowns/social_media";
import { usePrivileges } from "@/hooks/use-privileges";
interface LinkFormProps {
  onCancel: () => void;
  link?: PortfolioSkill;
  linkLength?: number;
}

const LinkForm = ({ onCancel, link, linkLength }: LinkFormProps) => {
  const queryClient = useQueryClient();
  const { canCreateRecord } = usePrivileges();

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(LinkFormSchema),
    defaultValues: link || {
      title: "",
      link: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => upsertSkill(data),
    onSuccess: () => {
      toast({
        title: "Link saved successfully",
        description: "You have successfully saved your link",
        duration: 1000,
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Could not save link",
        description: error.message,
        duration: 3000,
      });
    },
  });

  const onSubmit = (data: LinkFormValues) => {
    if (!link && !canCreateRecord("links", linkLength)) return;

    mutate({
      ...data,
      type: PortfolioSkillsTypes.link,
      id: link?.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a link type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SocialMediaOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://www.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button loading={isPending} type="submit" className="flex-1">
            Save Link
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LinkForm;
