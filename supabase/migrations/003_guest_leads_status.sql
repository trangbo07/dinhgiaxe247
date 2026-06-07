-- Chạy nếu đã tạo guest_leads từ bản cũ (chưa có cột status)
alter table public.guest_leads
  add column if not exists status text not null default 'moi';

-- Ràng buộc (bỏ qua nếu đã có)
do $$
begin
  alter table public.guest_leads
    add constraint guest_leads_status_check
    check (status in ('moi', 'da_lien_he', 'dong'));
exception
  when duplicate_object then null;
end $$;

create index if not exists guest_leads_status_idx on public.guest_leads (status);
