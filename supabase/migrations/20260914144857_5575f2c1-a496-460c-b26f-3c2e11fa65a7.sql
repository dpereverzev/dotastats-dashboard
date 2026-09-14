CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  steam_raw text NOT NULL,
  steam_key text NOT NULL UNIQUE,
  mmr integer NOT NULL,
  roles text NOT NULL DEFAULT '',
  is_captain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.draft (
  id text PRIMARY KEY DEFAULT 'main',
  started boolean NOT NULL DEFAULT false,
  pick_order uuid[] NOT NULL DEFAULT '{}',
  started_at timestamptz
);

CREATE TABLE public.picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_number integer NOT NULL UNIQUE,
  captain_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player_id uuid NOT NULL UNIQUE REFERENCES public.players(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.players TO anon, authenticated;
GRANT SELECT ON public.draft TO anon, authenticated;
GRANT SELECT ON public.picks TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
GRANT ALL ON public.draft TO service_role;
GRANT ALL ON public.picks TO service_role;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players readable" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "draft readable" ON public.draft FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "picks readable" ON public.picks FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.players (name, steam_raw, steam_key, mmr, roles, is_captain) VALUES
('QSN','123298700','123298700',7301,'5 Сап, 4 Сап, 3 Хард, 2 Мід, 1 Кєрі',true),
('olehuk170','https://steamcommunity.com/id/895684584587/','895684584587',7300,'3 Хард, 2 Мід, 1 Кєрі',true),
('godlikeprince','391677243','391677243',7000,'2 Мід, 1 Кєрі',true),
('Insomnia','https://steamcommunity.com/id/Insomnia_16/','insomnia_16',7000,'2 Мід',true),
('1_sanches_1 / SaNcheS','76561198413986816','76561198413986816',6722,'5 Сап',true),
('tera','https://steamcommunity.com/id/blessesme/','blessesme',6650,'3 Хард',true),
('nishka','https://steamcommunity.com/id/selectedd2/','selectedd2',6600,'3 Хард, 2 Мід, 1 Кєрі',true),
('Mashina','374256911','374256911',6583,'4 Сап, 1 Кєрі',true),
('Rimans geometry','1517863580','1517863580',6500,'2 Мід',false),
('mallet13','249553269','249553269',6400,'5 Сап, 4 Сап',false),
('hailrake prime','76561198830660107','76561198830660107',6400,'3 Хард, 2 Мід, 1 Кєрі',false),
('tttw67','444326846','444326846',6300,'5 Сап, 4 Сап, 1 Кєрі',false),
('Den','1053225098','1053225098',6300,'5 Сап, 4 Сап, 3 Хард, 2 Мід, 1 Кєрі',false),
('yolonikk67','yolonikk340xi','yolonikk340xi',6200,'5 Сап, 4 Сап, 3 Хард, 1 Кєрі',false),
('Maksim Pavlusenko','421454619','421454619',6150,'4 Сап, 3 Хард, 2 Мід',false),
('andrii3944','https://steamcommunity.com/profiles/76561198082314242/','76561198082314242',6100,'4 Сап, 1 Кєрі',false),
('Royal','307331934','307331934',6089,'3 Хард, 2 Мід',false),
('Джамал','76561198859690803','76561198859690803',6000,'2 Мід, 1 Кєрі',false),
('s.w.a.t.','488631742','488631742',6000,'4 Сап',false),
('RABBITS','1072868850','1072868850',6000,'3 Хард',false),
('заDOOMался','https://steamcommunity.com/profiles/76561199438408396/','76561199438408396',6000,'3 Хард',false),
('N0show','76561198408321850','76561198408321850',6000,'5 Сап, 4 Сап, 3 Хард, 2 Мід',false),
('Denys','376952605','376952605',5700,'5 Сап, 4 Сап, 3 Хард, 2 Мід, 1 Кєрі',false),
('.alone13.','876568713','876568713',5700,'3 Хард, 1 Кєрі',false),
('andriy12','https://steamcommunity.com/profiles/76561198864323863/','76561198864323863',5698,'5 Сап, 4 Сап, 3 Хард',false),
('Maliy','76561198995854454','76561198995854454',5600,'5 Сап, 4 Сап, 3 Хард, 2 Мід',false),
('bibkala','76561199634136273','76561199634136273',5600,'5 Сап, 4 Сап',false),
('Дядя Вася','142112452','142112452',5600,'5 Сап, 4 Сап',false),
('kvach_','76561198836576886','76561198836576886',5599,'4 Сап, 2 Мід',false),
('Akakiy','98258045','98258045',5500,'5 Сап, 4 Сап, 3 Хард',false),
('grimn_ice','172681724','172681724',5300,'5 Сап, 4 Сап, 2 Мід',false),
('Добрый','112210105','112210105',5100,'2 Мід, 1 Кєрі',false),
('METEOR','76561198344781895','76561198344781895',5000,'2 Мід, 1 Кєрі',false),
('bum41k','1109632862','1109632862',5000,'5 Сап, 4 Сап, 2 Мід',false),
('gektor6074','https://steamcommunity.com/profiles/76561198159757138/','76561198159757138',5000,'5 Сап, 4 Сап, 3 Хард',false),
('emberg0d','76561199219505155','76561199219505155',4800,'2 Мід, 1 Кєрі',false),
('могер','1090282771','1090282771',4350,'2 Мід',false),
('Chasey_Lain','124801702','124801702',3500,'5 Сап, 4 Сап',false),
('l1nkerrr','https://steamcommunity.com/profiles/76561199036402806/','76561199036402806',3000,'5 Сап, 4 Сап, 3 Хард',false),
('killua','765812422','765812422',3000,'5 Сап, 4 Сап, 3 Хард',false);

INSERT INTO public.draft (id) VALUES ('main');

ALTER PUBLICATION supabase_realtime ADD TABLE public.draft;
ALTER PUBLICATION supabase_realtime ADD TABLE public.picks;